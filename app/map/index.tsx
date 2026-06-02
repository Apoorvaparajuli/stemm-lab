import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map and GPS</Text>
      <Text style={styles.text}>
        This screen will use GPS/location services for context-aware mobile
        features.
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