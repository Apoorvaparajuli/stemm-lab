import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../lib/ThemeContext";

export default function AboutStemmScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "About STEMM Lab",
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: "800" },
    });
  }, [navigation, colors]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="flask-outline" size={36} color="#5B2EEA" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>STEMM Lab</Text>
        <Text style={[styles.version, { color: colors.subtext }]}>
          Version 1.0.0
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What is STEMM Lab?
        </Text>
        <Text style={[styles.text, { color: colors.subtext }]}>
          STEMM Lab helps student teams complete real-world Science, Technology,
          Engineering, Mathematics and Medicine challenges using mobile device
          features like sensors, GPS, camera and microphone.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Features
        </Text>

        {[
          { icon: "flask-outline", text: "Real-world STEMM challenges" },
          {
            icon: "mic-outline",
            text: "Sound level measurement via microphone",
          },
          {
            icon: "location-outline",
            text: "GPS location tagging for activities",
          },
          {
            icon: "phone-portrait-outline",
            text: "Accelerometer for earthquake activity",
          },
          { icon: "camera-outline", text: "Photo and video evidence capture" },
          { icon: "server-outline", text: "Offline SQLite local data cache" },
          {
            icon: "notifications-outline",
            text: "Challenge due date reminders",
          },
          { icon: "map-outline", text: "Interactive challenge map" },
        ].map((item, index) => (
          <View
            key={index}
            style={[styles.featureRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons name={item.icon as any} size={20} color="#5B2EEA" />
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>
              {item.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Technologies Used
        </Text>
        {[
          "React Native + Expo",
          "Firebase Auth + Firestore",
          "SQLite (expo-sqlite)",
          "expo-notifications",
          "expo-sensors (Accelerometer)",
          "expo-location + react-native-maps",
          "expo-av (Microphone)",
          "AdMob (react-native-google-mobile-ads)",
        ].map((tech, index) => (
          <View
            key={index}
            style={[styles.techRow, { borderBottomColor: colors.border }]}
          >
            <View style={styles.techDot} />
            <Text style={[styles.techText, { color: colors.subtext }]}>
              {tech}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Developed by
        </Text>
        <Text style={[styles.text, { color: colors.subtext }]}>
          Yacqub Ali & Apoorva Parajuli
        </Text>
        <Text style={[styles.text, { color: colors.subtext, marginTop: 4 }]}>
          Mobile Application Development — Assessment 4
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  version: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  techRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  techDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5B2EEA",
  },
  techText: {
    fontSize: 14,
  },
});
