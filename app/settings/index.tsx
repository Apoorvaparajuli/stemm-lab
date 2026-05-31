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
import { useTheme } from "../../lib/ThemeContext";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { isDark, toggleDark, colors } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Settings",
      headerBackTitle: "Back",
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: "800" },
    });
  }, [navigation, colors]);

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert("Required", "Please enter your password to confirm.");
      return;
    }

    try {
      setDeleting(true);

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) return;

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        deletePassword,
      );
      await reauthenticateWithCredential(currentUser, credential);
      await deleteDoc(doc(db, "users", currentUser.uid));
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>

          <SettingToggle
            icon="notifications-outline"
            title="Notifications"
            subtitle="Challenge reminders and team updates"
            value={notifications}
            onValueChange={setNotifications}
            colors={colors}
          />

          <SettingToggle
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark appearance"
            value={isDark}
            onValueChange={toggleDark}
            colors={colors}
          />

          <SettingToggle
            icon="location-outline"
            title="Location Access"
            subtitle="Used for GPS-based STEMM challenges"
            value={locationAccess}
            onValueChange={setLocationAccess}
            colors={colors}
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>

          <Link href="/settings/edit" asChild>
            <SettingButton
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update team name, members and year level"
              colors={colors}
            />
          </Link>

          <Link href="/settings/stemm-lab" asChild>
            <SettingButton
              icon="information-circle-outline"
              title="About STEMM Lab"
              subtitle="Real-world STEMM learning activities"
              colors={colors}
            />
          </Link>

          <SettingButton
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out of your account"
            colors={colors}
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
            colors={colors}
            onPress={() => setShowDeleteModal(true)}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="warning-outline" size={32} color="#FF4D4F" />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Delete Account
            </Text>
            <Text style={[styles.modalText, { color: colors.subtext }]}>
              This will permanently delete your account and all your data from
              Firebase. This cannot be undone.
            </Text>

            <Text style={[styles.modalLabel, { color: colors.text }]}>
              Enter your password to confirm
            </Text>
            <TextInput
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Your password"
              placeholderTextColor="#9A94A6"
              secureTextEntry
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
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
  colors,
}: {
  icon: any;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: any;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.background }]}>
        <Ionicons name={icon} size={22} color="#5B2EEA" />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
          {subtitle}
        </Text>
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
  colors,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress?: () => void;
  danger?: boolean;
  colors: any;
}) {
  return (
    <Pressable
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? "#FFEAEA" : colors.background },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={danger ? "#FF4D4F" : "#5B2EEA"}
        />
      </View>
      <View style={styles.rowText}>
        <Text
          style={[styles.rowTitle, { color: danger ? "#FF4D4F" : colors.text }]}
        >
          {title}
        </Text>
        <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
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
  },
  modalText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "800",
    alignSelf: "flex-start",
  },
  modalInput: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
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
