import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../lib/ThemeContext";

const resources = [
  {
    title: "Parachute Forces",
    subtitle: "Gravity pulls down, drag pushes up.",
    icon: "parachute",
    color: "#5B2EEA",
    formula: "Weight = mass × gravity",
  },
  {
    title: "Final Velocity",
    subtitle: "Used to estimate how fast the toy falls.",
    icon: "speedometer",
    color: "#FF9F1C",
    formula: "velocity = distance ÷ time",
  },
  {
    title: "Acceleration",
    subtitle: "Measures how quickly speed changes.",
    icon: "trending-up",
    color: "#25B46B",
    formula: "acceleration = velocity ÷ time",
  },
  {
    title: "Net Force",
    subtitle: "Total force acting on the object.",
    icon: "vector-combine",
    color: "#3B82F6",
    formula: "net force = mass × acceleration",
  },
  {
    title: "Sound Pollution",
    subtitle: "Compare quiet and noisy environments.",
    icon: "volume-high",
    color: "#EF4444",
    formula: "record sound level observations",
  },
  {
    title: "Reaction Time",
    subtitle: "Measures how quickly a person responds.",
    icon: "gesture-tap",
    color: "#7C3AED",
    formula: "average = total time ÷ attempts",
  },
];

export default function ResourcesScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Resources</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          STEMM formulas and notes to help complete your activities.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Ionicons name="school-outline" size={28} color="#5B2EEA" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Learning Support
            </Text>
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              Use these quick notes while completing challenges, recording
              results and writing reflections.
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {resources.map((item) => (
            <View
              key={item.title}
              style={[styles.resourceCard, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: `${item.color}18` },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={28}
                  color={item.color}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>
                  {item.subtitle}
                </Text>

                <View
                  style={[
                    styles.formulaBox,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text style={styles.formulaText}>{item.formula}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  infoCard: {
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  list: { gap: 14 },
  resourceCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    gap: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  formulaBox: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 10,
  },
  formulaText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#5B2EEA",
  },
});
