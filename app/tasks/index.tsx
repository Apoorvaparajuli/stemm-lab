import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>STEM Tasks</Text>
      <Text style={styles.text}>
        This screen will show learning tasks, quizzes, and practical activities.
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