import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default function TasksScreen() {
  const challenges = [
    {
      id: "1",
      title: "River Water Analysis",
      difficulty: "Medium",
    },

    {
      id: "2",
      title: "Plant Growth Observation",
      difficulty: "Easy",
    },

    {
      id: "3",
      title: "Air Pollution Study",
      difficulty: "Hard",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>STEM Challenges</Text>

      <Text style={styles.subtitle}>
        Complete science and engineering activities
      </Text>
      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/tasks/add")}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </Pressable>

      {challenges.map((challenge) => (
        <Pressable
          key={challenge.id}
          style={styles.card}
          onPress={() => router.push(`/tasks/${challenge.id}`)}
        >
          <Text style={styles.cardTitle}>{challenge.title}</Text>

          <Text style={styles.cardDifficulty}>
            Difficulty: {challenge.difficulty}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginTop: 20,
  },

  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  cardDifficulty: {
    marginTop: 8,
    color: "#2563EB",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
