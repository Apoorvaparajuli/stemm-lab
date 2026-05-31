import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth, db } from "../../../lib/firebase";
import { useTheme } from "../../../lib/ThemeContext";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [members, setMembers] = useState<string[]>([""]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Edit Profile",
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: "800" },
    });
  }, [navigation, colors]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setEmail(currentUser.email || "");
      setFirstName(currentUser.displayName || "");

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setLoading(false);
        return;
      }

      const data = userSnap.data();
      const savedTeamCode = data.teamCode || "";
      let savedTeamName = data.teamName || "";

      if (!savedTeamName && savedTeamCode) {
        const teamSnap = await getDoc(doc(db, "teams", savedTeamCode));
        if (teamSnap.exists()) {
          const teamData = teamSnap.data();
          savedTeamName = teamData.teamName || teamData.name || "";
        }
      }

      setFirstName(data.firstName || currentUser.displayName || "");
      setEmail(data.email || currentUser.email || "");
      setTeamName(savedTeamName);
      setTeamCode(savedTeamCode);
      setYearLevel(data.yearLevel || "");
      setMembers(data.members?.length ? data.members : [""]);
    } catch (error) {
      console.log("Load profile error:", error);
      Alert.alert("Error", "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const updateMember = (index: number, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    setMembers(updatedMembers);
  };

  const addMember = () => {
    setMembers([...members, ""]);
  };

  const removeMember = (index: number) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers.length ? updatedMembers : [""]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "You are not logged in.");
        return;
      }

      const cleanMembers = members.map((m) => m.trim()).filter(Boolean);

      await updateDoc(doc(db, "users", currentUser.uid), {
        firstName: firstName.trim(),
        teamName: teamName.trim(),
        yearLevel: yearLevel.trim(),
        members: cleanMembers,
        updatedAt: serverTimestamp(),
      });

      await updateProfile(currentUser, {
        displayName: firstName.trim(),
      });

      Alert.alert("Saved", "Profile updated successfully.");
    } catch (error) {
      console.log("Save profile error:", error);
      Alert.alert("Error", "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingScreen, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View
            style={[styles.iconWrap, { backgroundColor: colors.background }]}
          >
            <Ionicons name="person-outline" size={34} color="#5B2EEA" />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Edit Profile
          </Text>

          <Text style={[styles.text, { color: colors.subtext }]}>
            Update your account details, team members and year level.
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Details
          </Text>

          <InputField
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            colors={colors}
          />

          <InputField
            label="Email"
            value={email}
            onChangeText={() => {}}
            placeholder="Enter email"
            editable={false}
            colors={colors}
          />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Team Details
          </Text>

          <InputField
            label="Team Name"
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
            colors={colors}
          />

          <InputField
            label="Team Code"
            value={teamCode}
            onChangeText={() => {}}
            placeholder="Team code"
            editable={false}
            colors={colors}
          />

          <InputField
            label="Year Level"
            value={yearLevel}
            onChangeText={setYearLevel}
            placeholder="Enter year level"
            colors={colors}
          />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Team Members
          </Text>

          {members.map((member, index) => (
            <View key={index} style={styles.memberInputRow}>
              <View style={{ flex: 1 }}>
                <InputField
                  label={`Member ${index + 1}`}
                  value={member}
                  onChangeText={(value) => updateMember(index, value)}
                  placeholder="Enter member name"
                  colors={colors}
                />
              </View>

              {members.length > 1 && (
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeMember(index)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF4D4F" />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable
            style={[
              styles.addMemberButton,
              { backgroundColor: colors.background },
            ]}
            onPress={addMember}
          >
            <Ionicons name="add-circle-outline" size={22} color="#5B2EEA" />
            <Text style={styles.addMemberText}>Add Team Member</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  editable?: boolean;
  colors: any;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: editable ? colors.input : colors.border,
            borderColor: colors.border,
            color: editable ? colors.text : colors.subtext,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 14,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  formCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
    borderWidth: 1,
  },
  memberInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  removeButton: {
    width: 44,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFEAEA",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  addMemberButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  addMemberText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#5B2EEA",
  },
  saveButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#5B2EEA",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
