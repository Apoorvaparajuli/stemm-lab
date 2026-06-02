import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>STEM Dashboard</Text>
      <Text style={styles.subtitle}>
        Learn science, technology, engineering and mathematics through tasks,
        resources and location-based activities.
      </Text>

      <View style={styles.grid}>
        <MenuCard title="Tasks" onPress={() => router.push("/tasks")} />
        <MenuCard title="Resources" onPress={() => router.push("/resources")} />
        <MenuCard title="Map / GPS" onPress={() => router.push("/map")} />
        <MenuCard title="Safety" onPress={() => router.push("/safety")} />
        <MenuCard title="Profile" onPress={() => router.push("/profile")} />
        <MenuCard title="Settings" onPress={() => router.push("/settings")} />
      </View>
    </ScrollView>
  );
}

function MenuCard({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: {
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});