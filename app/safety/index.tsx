import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SafetyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety</Text>
      <Text style={styles.text}>
        This screen can include emergency guidance, sensor-based alerts, and
        safety notifications.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
});