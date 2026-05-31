import { Ionicons } from "@expo/vector-icons";
import { Link, router, useNavigation } from "expo-router";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { useLayoutEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { auth, db } from "../../lib/firebase";

export default function SettingsScreen() {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationAccess, setLocationAccess] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Settings",
      headerBackTitle: "Back",
      headerStyle: { backgroundColor: "#F7F4FF" },
      headerShadowVisible: false,
      headerTintColor: "#1D1828",
      headerTitleStyle: { fontWeight: "800" },
    });
  }, [navigation]);

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert("Required", "Please enter your password to confirm.");
      return;
    }

    try {
      setDeleting(true);

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) return;

      // Re-authenticate first — Firebase requires this before deletion
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        deletePassword,
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", currentUser.uid));

      // Delete Firebase Auth account
      await deleteUser(currentUser);

      setShowDeleteModal(false);
      setDeletePassword("");

      Alert.alert(
        "Account deleted",
        "Your account has been permanently deleted.",
        [{ text: "OK", onPress: () => router.replace("/welcome") }],
      );
    } catch (error: any) {
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert("Wrong password", "Please enter your correct password.");
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert("Too many attempts", "Please try again later.");
      } else {
        Alert.alert("Error", "Could not delete account. Please try again.");
        console.log("Delete account error:", error);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <SettingToggle
            icon="notifications-outline"
            title="Notifications"
            subtitle="Challenge reminders and team updates"
            value={notifications}
            onValueChange={setNotifications}
          />

          <SettingToggle
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark appearance"
            value={darkMode}
            onValueChange={setDarkMode}
          />

          <SettingToggle
            icon="location-outline"
            title="Location Access"
            subtitle="Used for GPS-based STEMM challenges"
            value={locationAccess}
            onValueChange={setLocationAccess}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Link href="/settings/edit" asChild>
            <SettingButton
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update team name, members and year level"
            />
          </Link>

          <Link href="/settings/stemm-lab" asChild>
            <SettingButton
              icon="information-circle-outline"
              title="About STEMM Lab"
              subtitle="Real-world STEMM learning activities"
            />
          </Link>

          <SettingButton
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={() =>
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await signOut(auth);
                      router.replace("/welcome");
                    } catch (error) {
                      console.log("Logout error:", error);
                      Alert.alert(
                        "Error",
                        "Failed to logout. Please try again.",
                      );
                    }
                  },
                },
              ])
            }
          />

          <SettingButton
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently remove your account and data"
            danger
            onPress={() => setShowDeleteModal(true)}
          />
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="warning-outline" size={32} color="#FF4D4F" />
            </View>

            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              This will permanently delete your account and all your data from
              Firebase. This cannot be undone.
            </Text>

            <Text style={styles.modalLabel}>
              Enter your password to confirm
            </Text>
            <TextInput
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Your password"
              placeholderTextColor="#9A94A6"
              secureTextEntry
              style={styles.modalInput}
            />

            <Pressable
              style={[styles.modalDeleteButton, deleting && { opacity: 0.6 }]}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              <Text style={styles.modalDeleteButtonText}>
                {deleting ? "Deleting..." : "Delete My Account"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.modalCancelButton}
              onPress={() => {
                setShowDeleteModal(false);
                setDeletePassword("");
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingToggle({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: any;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={22} color="#5B2EEA" />
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#DDD3FF", true: "#B8A8FF" }}
        thumbColor={value ? "#5B2EEA" : "#FFFFFF"}
      />
    </View>
  );
}

function SettingButton({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.rowIcon, danger && styles.dangerIcon]}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? "#FF4D4F" : "#5B2EEA"}
        />
      </View>

      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#8C8796" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F4FF",
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1D1828",
    marginBottom: 10,
  },
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1EEFA",
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerIcon: {
    backgroundColor: "#FFEAEA",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1D1828",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#7A7288",
    marginTop: 3,
  },
  dangerText: {
    color: "#FF4D4F",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFEAEA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1D1828",
  },
  modalText: {
    fontSize: 14,
    color: "#6F687D",
    textAlign: "center",
    lineHeight: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D1828",
    alignSelf: "flex-start",
  },
  modalInput: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEEAFD",
    backgroundColor: "#FBFAFF",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1D1828",
  },
  modalDeleteButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FF4D4F",
    alignItems: "center",
    justifyContent: "center",
  },
  modalDeleteButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  modalCancelButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F3F0FA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: "#5B2EEA",
    fontSize: 15,
    fontWeight: "800",
  },
});
