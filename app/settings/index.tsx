import { Ionicons } from "@expo/vector-icons";
import { Link, router, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { logOut } from "../../lib/auth";
import {
  cancelAllReminders,
  requestNotificationPermission,
  saveNotificationPreference,
  scheduleDailyReminder,
  scheduleTestReminder,
} from "../../lib/notifications";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(false);
  const [locationAccess, setLocationAccess] = useState(true);

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

  useEffect(() => {
    requestNotificationPermission().then(setNotifications);
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          "Permission denied",
          "Please enable notifications in your device settings.",
        );
        return;
      }
      await scheduleDailyReminder();
      if (user) await saveNotificationPreference(user.uid, true);
      setNotifications(true);
    } else {
      await cancelAllReminders();
      if (user) await saveNotificationPreference(user.uid, false);
      setNotifications(false);
    }
  };

  const handleTestNotification = async () => {
    if (!notifications) {
      Alert.alert("Notifications off", "Enable notifications first.");
      return;
    }
    await scheduleTestReminder(10);
    Alert.alert(
      "Test sent!",
      "You'll receive a notification in 10 seconds. Lock your screen to see it.",
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logOut();
            router.replace("/login");
          } catch {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
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
            onValueChange={handleNotificationToggle}
          />

          <SettingToggle
            icon="location-outline"
            title="Location Access"
            subtitle="Used for GPS-based STEMM challenges"
            value={locationAccess}
            onValueChange={setLocationAccess}
          />
        </View>

        {notifications && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Test Notifications</Text>
            <Pressable
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>
                Send Test Notification (10s)
              </Text>
            </Pressable>
            <Text style={styles.testHint}>
              Lock your phone or go to home screen after tapping.
            </Text>
          </View>
        )}

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
            onPress={handleLogout}
          />

          <SettingButton
            icon="trash-outline"
            title="Delete Account"
            subtitle="Remove account and team data"
            danger
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "Account deletion will be connected to Firebase in a future update.",
              )
            }
          />
        </View>
      </ScrollView>
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
  screen: { flex: 1, backgroundColor: "#F7F4FF" },
  content: { padding: 18, paddingBottom: 40 },
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
  dangerIcon: { backgroundColor: "#FFEAEA" },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "800", color: "#1D1828" },
  rowSubtitle: { fontSize: 12, color: "#7A7288", marginTop: 3 },
  dangerText: { color: "#FF4D4F" },
  testButton: {
    backgroundColor: "#5B2EEA",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  testButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  testHint: { fontSize: 12, color: "#7A7288", textAlign: "center" },
});
