import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getAuthErrorMessage, signUp } from "../../lib/auth";

const STEPS = ["Account", "Team", "Members", "Review"];

export default function RegisterScreen() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [teamName, setTeamName] = useState("");
  const [yearLevel, setYearLevel] = useState("");

  const [members, setMembers] = useState([""]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const setError = (key: string, msg: string) =>
    setErrors((prev) => ({ ...prev, [key]: msg }));

  const clearError = (key: string) =>
    setErrors((prev) => ({ ...prev, [key]: "" }));

  const validateStep = () => {
    if (step === 0) {
      if (!firstName.trim()) {
        setError("firstName", "First name is required.");
        return false;
      }
      if (!email.trim()) {
        setError("email", "Email is required.");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("email", "Enter a valid email.");
        return false;
      }
      if (!password || password.length < 6) {
        setError("password", "Password must be at least 6 characters.");
        return false;
      }
    }
    if (step === 1) {
      if (!teamName.trim()) {
        setError("teamName", "Team name is required.");
        return false;
      }
      if (!yearLevel.trim()) {
        setError("yearLevel", "Year level is required.");
        return false;
      }
    }
    if (step === 2) {
      if (!members.some((m) => m.trim())) {
        setError("members", "Add at least one team member.");
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    setErrors({});
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleCreateAccount();
    }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      await signUp({
        email,
        password,
        firstName,
        teamName,
        yearLevel,
        members,
      });
      router.replace("/home");
    } catch (error: any) {
      const message = getAuthErrorMessage(error?.code);
      if (
        error?.code === "auth/email-already-in-use" ||
        error?.code === "auth/invalid-email"
      ) {
        setStep(0);
        setError("email", message);
      } else if (error?.code === "auth/weak-password") {
        setStep(0);
        setError("password", message);
      } else {
        setError("general", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.progressBar, i <= step && styles.progressBarActive]}
          />
        ))}
      </View>

      <Text style={styles.stepLabel}>
        Step {step + 1} of {STEPS.length}
      </Text>

      {step === 0 && (
        <>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Enter your student details.</Text>
          <Field
            label="First Name"
            value={firstName}
            onChangeText={(v) => {
              setFirstName(v);
              clearError("firstName");
            }}
            placeholder="e.g. Alex"
            error={errors.firstName}
          />
          <Field
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearError("email");
            }}
            placeholder="student@email.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Field
            label="Password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearError("password");
            }}
            placeholder="Min. 6 characters"
            secureTextEntry
            error={errors.password}
          />
        </>
      )}

      {step === 1 && (
        <>
          <Text style={styles.title}>Set up your team</Text>
          <Text style={styles.subtitle}>Your team details for STEMM Lab.</Text>
          <Field
            label="Team Name"
            value={teamName}
            onChangeText={(v) => {
              setTeamName(v);
              clearError("teamName");
            }}
            placeholder="e.g. Team Newton"
            error={errors.teamName}
          />
          <Field
            label="Year Level"
            value={yearLevel}
            onChangeText={(v) => {
              setYearLevel(v);
              clearError("yearLevel");
            }}
            placeholder="e.g. Year 8"
            error={errors.yearLevel}
          />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Add team members</Text>
          <Text style={styles.subtitle}>Enter first name of each member.</Text>
          {members.map((member, i) => (
            <View key={i} style={styles.memberRow}>
              <View style={{ flex: 1 }}>
                <Field
                  label={`Member ${i + 1}`}
                  value={member}
                  onChangeText={(v) => {
                    const updated = [...members];
                    updated[i] = v;
                    setMembers(updated);
                    clearError("members");
                  }}
                  placeholder="First name"
                />
              </View>
              {members.length > 1 && (
                <Pressable
                  style={styles.removeBtn}
                  onPress={() =>
                    setMembers(members.filter((_, idx) => idx !== i))
                  }
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
          {!!errors.members && (
            <Text style={styles.errorText}>{errors.members}</Text>
          )}
          <Pressable
            style={styles.addMemberBtn}
            onPress={() => setMembers([...members, ""])}
          >
            <Text style={styles.addMemberText}>+ Add Member</Text>
          </Pressable>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Review details</Text>
          <Text style={styles.subtitle}>
            Confirm before creating your account.
          </Text>
          <View style={styles.reviewCard}>
            <ReviewRow label="Name" value={firstName} />
            <ReviewRow label="Email" value={email} />
            <ReviewRow label="Team" value={teamName} />
            <ReviewRow label="Year Level" value={yearLevel} />
            <ReviewRow
              label="Members"
              value={members.filter((m) => m.trim()).join(", ")}
            />
          </View>
        </>
      )}

      {!!errors.general && (
        <Text style={[styles.errorText, { marginTop: 12 }]}>
          {errors.general}
        </Text>
      )}

      <View style={styles.buttonRow}>
        {step > 0 && (
          <Pressable
            style={styles.backBtn}
            onPress={() => setStep((s) => s - 1)}
            disabled={loading}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.nextBtn,
            loading && styles.btnDisabled,
            step === 0 && { flex: 1 },
          ]}
          onPress={goNext}
          disabled={loading}
        >
          <Text style={styles.nextBtnText}>
            {loading
              ? "Creating..."
              : step === STEPS.length - 1
                ? "Create Account"
                : "Continue →"}
          </Text>
        </Pressable>
      </View>

      {step === 0 && (
        <Pressable onPress={() => router.back()}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Field({
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
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  error?: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 24, paddingBottom: 40 },
  progressRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 99,
    backgroundColor: "#E5E7EB",
  },
  progressBarActive: { backgroundColor: "#2563EB" },
  stepLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "600",
  },
  title: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 6 },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#111827",
  },
  inputError: { borderColor: "#EF4444" },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  removeBtnText: { color: "#EF4444", fontWeight: "700" },
  addMemberBtn: {
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  addMemberText: { color: "#2563EB", fontWeight: "700" },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  reviewRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  reviewLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 2,
  },
  reviewValue: { fontSize: 15, color: "#111827", fontWeight: "700" },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 28 },
  backBtn: {
    flex: 0.4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backBtnText: { color: "#374151", fontWeight: "700" },
  nextBtn: {
    flex: 0.6,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  nextBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  loginLink: {
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 20,
  },
});
