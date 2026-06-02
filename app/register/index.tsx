import { Ionicons } from "@expo/vector-icons";
import { Link, router, useNavigation } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../lib/firebase";

const TOTAL_STEPS = 5;

const getFirebaseErrorMessage = (code?: string) => {
  if (code === "auth/email-already-in-use") {
    return "This email already has an account. Try logging in instead.";
  }

  if (code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  if (code === "auth/weak-password") {
    return "Password is too weak. Use at least 6 characters.";
  }

  if (code === "auth/network-request-failed") {
    return "Network error. Check your internet and try again.";
  }

  return "Something went wrong. Please try again.";
};

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [teamName, setTeamName] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [members, setMembers] = useState([""]);

  const [firstNameError, setFirstNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [teamNameError, setTeamNameError] = useState("");
  const [yearLevelError, setYearLevelError] = useState("");
  const [membersError, setMembersError] = useState("");

  const teamCode = useMemo(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    return `STEMM-${code}`;
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const validateStepOne = () => {
    let valid = true;

    setFirstNameError("");
    setEmailError("");
    setPasswordError("");

    if (!firstName.trim()) {
      setFirstNameError("First name is required.");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }

    return valid;
  };

  const validateStepTwo = () => {
    let valid = true;

    setTeamNameError("");
    setYearLevelError("");

    if (!teamName.trim()) {
      setTeamNameError("Team name is required.");
      valid = false;
    }

    if (!yearLevel.trim()) {
      setYearLevelError("Year level is required.");
      valid = false;
    }

    return valid;
  };

  const validateStepThree = () => {
    setMembersError("");

    const hasMember = members.some((member) => member.trim());

    if (!hasMember) {
      setMembersError("Add at least one team member.");
      return false;
    }

    return true;
  };

  const canContinueCurrentStep = () => {
    if (step === 1) return validateStepOne();
    if (step === 2) return validateStepTwo();
    if (step === 3) return validateStepThree();
    return true;
  };

  const goNext = () => {
    if (loading) return;

    if (!canContinueCurrentStep()) return;

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      return;
    }

    handleCreateAccount();
  };

  const goBack = () => {
    if (loading) return;

    if (step === 1) {
      router.back();
      return;
    }

    setStep((prev) => prev - 1);
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
    setMembersError("");
  };

  const addMember = () => {
    setMembers([...members, ""]);
  };

  const removeMember = (index: number) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);

      setEmailError("");
      setPasswordError("");

      const cleanFirstName = firstName.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanTeamName = teamName.trim();
      const cleanYearLevel = yearLevel.trim();
      const cleanMembers = members
        .map((member) => member.trim())
        .filter(Boolean);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: cleanFirstName,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: cleanFirstName,
        email: cleanEmail,
        teamName: cleanTeamName,
        teamCode,
        yearLevel: cleanYearLevel,
        members: cleanMembers,
        role: "student",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Account created", "Your STEMM Lab account is ready.", [
        {
          text: "Continue",
          onPress: () => router.replace("/home"),
        },
      ]);
    } catch (error: any) {
      console.log("Signup error:", error);

      const message = getFirebaseErrorMessage(error?.code);

      if (
        error?.code === "auth/email-already-in-use" ||
        error?.code === "auth/invalid-email"
      ) {
        setStep(1);
        setEmailError(message);
        return;
      }

      if (error?.code === "auth/weak-password") {
        setStep(1);
        setPasswordError(message);
        return;
      }

      Alert.alert("Signup failed", message);
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => (
    <View style={styles.progressRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressBar,
            index + 1 <= step && styles.progressBarActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.backButton}
            onPress={goBack}
            disabled={loading}
          >
            <Ionicons name="chevron-back" size={24} color="#1D1828" />
          </Pressable>

          {renderProgress()}

          {step === 1 && (
            <>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                Enter your student details to start using STEMM Lab.
              </Text>

              <Input
                label="First Name"
                value={firstName}
                onChangeText={(value) => {
                  setFirstName(value);
                  setFirstNameError("");
                }}
                placeholder="e.g. Yacqub"
                error={firstNameError}
              />

              <Input
                label="Email"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setEmailError("");
                }}
                placeholder="Enter email"
                keyboardType="email-address"
                error={emailError}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setPasswordError("");
                }}
                placeholder="Create password"
                secureTextEntry
                error={passwordError}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>Set up your team</Text>
              <Text style={styles.subtitle}>
                This matches the STEMM Lab startup requirement.
              </Text>

              <Input
                label="Team Name"
                value={teamName}
                onChangeText={(value) => {
                  setTeamName(value);
                  setTeamNameError("");
                }}
                placeholder="e.g. Team Newton"
                error={teamNameError}
              />

              <Input
                label="Grade / Year Level"
                value={yearLevel}
                onChangeText={(value) => {
                  setYearLevel(value);
                  setYearLevelError("");
                }}
                placeholder="e.g. Year 8"
                error={yearLevelError}
              />

              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>Team Discriminator</Text>
                <Text style={styles.codeValue}>{teamCode}</Text>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.title}>Add team members</Text>
              <Text style={styles.subtitle}>
                Enter the first name of each team member.
              </Text>

              {members.map((member, index) => (
                <View key={index} style={styles.memberRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label={`Member ${index + 1}`}
                      value={member}
                      onChangeText={(value) => updateMember(index, value)}
                      placeholder="First name"
                    />
                  </View>

                  {members.length > 1 && (
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => removeMember(index)}
                      disabled={loading}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#FF4D4F"
                      />
                    </Pressable>
                  )}
                </View>
              ))}

              {!!membersError && (
                <Text style={styles.errorText}>{membersError}</Text>
              )}

              <Pressable
                style={styles.addButton}
                onPress={addMember}
                disabled={loading}
              >
                <Ionicons name="add-circle-outline" size={22} color="#5B2EEA" />
                <Text style={styles.addButtonText}>Add Team Member</Text>
              </Pressable>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.title}>What you’ll do</Text>
              <Text style={styles.subtitle}>
                STEMM Lab turns real-world activities into mobile learning
                challenges.
              </Text>

              <Feature
                icon="map-outline"
                title="GPS Challenges"
                text="Complete location-tagged STEMM activities."
              />

              <Feature
                icon="camera-outline"
                title="Evidence Uploads"
                text="Submit photos, videos, observations and results."
              />

              <Feature
                icon="flash-outline"
                title="Device Tools"
                text="Use battery, torch, stopwatch, sound and sensors."
              />
            </>
          )}

          {step === 5 && (
            <>
              <Text style={styles.title}>Review details</Text>
              <Text style={styles.subtitle}>
                This data will be saved to Firebase when your account is
                created.
              </Text>

              <View style={styles.reviewCard}>
                <Review label="First Name" value={firstName} />
                <Review label="Email" value={email} />
                <Review label="Team Name" value={teamName} />
                <Review label="Team Code" value={teamCode} />
                <Review label="Year Level" value={yearLevel} />
                <Review
                  label="Members"
                  value={members
                    .map((m) => m.trim())
                    .filter(Boolean)
                    .join(", ")}
                />
              </View>
            </>
          )}

          <Pressable
            style={[
              styles.primaryButton,
              loading && styles.primaryButtonDisabled,
            ]}
            onPress={goNext}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading
                ? "Creating..."
                : step === TOTAL_STEPS
                  ? "Create Account"
                  : "Continue"}
            </Text>
          </Pressable>

          {step === 1 && (
            <Link href="/login" style={styles.loginLink}>
              Already have an account? Login
            </Link>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  error?: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A39BAD"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color="#5B2EEA" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F4FF",
  },
  content: {
    flexGrow: 1,
    padding: 22,
    paddingBottom: 32,
    justifyContent: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#DDD3FF",
  },
  progressBarActive: {
    backgroundColor: "#5B2EEA",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1D1828",
    letterSpacing: -0.8,
  },
  inputError: {
    borderColor: "#FF4D4F",
    backgroundColor: "#FFF7F7",
  },
  errorText: {
    color: "#FF4D4F",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A7288",
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 22,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D1828",
    marginBottom: 7,
  },
  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
    color: "#1D1828",
    borderWidth: 1,
    borderColor: "#E5DDF7",
  },
  codeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 4,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7A7288",
  },
  codeValue: {
    fontSize: 26,
    fontWeight: "900",
    color: "#5B2EEA",
    marginTop: 6,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  removeButton: {
    width: 44,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFEAEA",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  addButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#5B2EEA",
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1D1828",
  },
  featureText: {
    fontSize: 13,
    color: "#7A7288",
    lineHeight: 19,
    marginTop: 3,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  reviewRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1EEFA",
    paddingVertical: 12,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7A7288",
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1D1828",
    marginTop: 4,
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#5B2EEA",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  loginLink: {
    color: "#5B2EEA",
    fontWeight: "800",
    textAlign: "center",
    marginTop: 18,
  },
});
