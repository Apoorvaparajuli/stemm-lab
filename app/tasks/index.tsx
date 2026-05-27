import { router } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { db } from "../../lib/firebase";

type Challenge = {
  id: string;
  title: string;
  difficulty: string;
  description?: string;
  status?: string;
};

export default function TasksScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError("");
      const q = query(collection(db, "challenges"), orderBy("title", "asc"));
      const snapshot = await getDocs(q);
      const loaded = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Challenge, "id">),
      }));
      setChallenges(loaded);
    } catch (err) {
      console.log("Error loading challenges:", err);
      setError("Failed to load challenges. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.addButtonText}>+ Submit Result</Text>
      </Pressable>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      )}

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadChallenges}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && challenges.length === 0 && (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>
            No challenges found in Firestore yet.
          </Text>
        </View>
      )}

      {challenges.map((challenge) => (
        <Pressable
          key={challenge.id}
          style={styles.card}
          onPress={() => router.push(`/tasks/${challenge.id}`)}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>{challenge.title}</Text>
            {challenge.status === "Completed" && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDifficulty}>
            Difficulty: {challenge.difficulty}
          </Text>
          {challenge.description && (
            <Text style={styles.cardDesc}>{challenge.description}</Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20 },
  title: { fontSize: 30, fontWeight: "800", color: "#111827", marginTop: 20 },
  subtitle: { fontSize: 16, color: "#64748B", marginTop: 8, marginBottom: 24 },
  addButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827", flex: 1 },
  cardDifficulty: {
    marginTop: 6,
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },
  cardDesc: { marginTop: 6, color: "#64748B", fontSize: 13, lineHeight: 18 },
  completedBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: { color: "#065F46", fontSize: 11, fontWeight: "700" },
  centerBox: { alignItems: "center", paddingVertical: 40, gap: 10 },
  loadingText: { color: "#64748B", fontSize: 14 },
  emptyText: { color: "#64748B", fontSize: 14, textAlign: "center" },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: { color: "#991B1B", fontSize: 14, fontWeight: "600" },
  retryText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
});
