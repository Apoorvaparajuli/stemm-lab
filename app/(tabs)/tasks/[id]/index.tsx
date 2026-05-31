import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { db } from "../../../../lib/firebase";
import { useTheme } from "../../../../lib/ThemeContext";

type Challenge = {
  id: string;
  title: string;
  description: string;
  priority: string;
  due: string;
  category?: string;
  difficulty?: string;
  color: string;
  icon: string;
  tasks?: string[];
};

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  input: string; // ← add this
};

// ─── Reaction Board Tool ───────────────────────────────────────────────────
function ReactionBoardTool({ colors }: { colors: ThemeColors }) {
  const [phase, setPhase] = useState<"waiting" | "ready" | "tap" | "result">(
    "waiting",
  );
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTest = () => {
    setPhase("ready");
    setReactionTime(null);
    const delay = 2000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setPhase("tap");
    }, delay);
  };

  const handleTap = () => {
    if (phase === "tap") {
      const ms = Date.now() - startTimeRef.current;
      setReactionTime(ms);
      setResults((prev) => [...prev, ms]);
      setPhase("result");
    } else if (phase === "ready") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase("waiting");
      Alert.alert("Too early!", "Wait for the green screen before tapping.");
    }
  };

  const avg =
    results.length > 0
      ? Math.round(results.reduce((a, b) => a + b, 0) / results.length)
      : null;

  const bgColor =
    phase === "tap" ? "#25B46B" : phase === "ready" ? "#FF9F1C" : "#5B2EEA";

  return (
    <View style={styles.toolSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Reaction Board
      </Text>

      <Pressable
        style={[styles.reactionBox, { backgroundColor: bgColor }]}
        onPress={
          phase === "waiting" || phase === "result" ? startTest : handleTap
        }
      >
        <Text style={styles.reactionEmoji}>
          {phase === "waiting"
            ? "👆"
            : phase === "ready"
              ? "⏳"
              : phase === "tap"
                ? "🟢"
                : "✅"}
        </Text>
        <Text style={styles.reactionLabel}>
          {phase === "waiting"
            ? "Tap to Start"
            : phase === "ready"
              ? "Wait for green..."
              : phase === "tap"
                ? "TAP NOW!"
                : `${reactionTime} ms`}
        </Text>
        {phase === "result" && (
          <Text style={styles.reactionSub}>Tap again to retry</Text>
        )}
      </Pressable>

      {results.length > 0 && (
        <View style={[styles.resultsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            Results
          </Text>
          {results.map((r, i) => (
            <View key={i} style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.subtext }]}>
                Attempt {i + 1}
              </Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>
                {r} ms
              </Text>
            </View>
          ))}
          {avg !== null && (
            <View
              style={[styles.resultAvgRow, { borderTopColor: colors.border }]}
            >
              <Text style={styles.resultAvgLabel}>Average</Text>
              <Text style={styles.resultAvgValue}>{avg} ms</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Accelerometer Tool ────────────────────────────────────────────────────
function AccelerometerTool({ colors }: { colors: ThemeColors }) {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [recording, setRecording] = useState(false);
  const [peak, setPeak] = useState(0);
  const subRef = useRef<any>(null);

  const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

  const toggleRecording = () => {
    if (recording) {
      subRef.current?.remove();
      subRef.current = null;
      setRecording(false);
    } else {
      setPeak(0);
      Accelerometer.setUpdateInterval(100);
      subRef.current = Accelerometer.addListener((d) => {
        setData(d);
        const mag = Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2);
        setPeak((prev) => Math.max(prev, mag));
      });
      setRecording(true);
    }
  };

  useEffect(() => {
    return () => subRef.current?.remove();
  }, []);

  const getShakeLabel = (mag: number) => {
    if (mag < 1.1) return { label: "Stable", color: "#25B46B" };
    if (mag < 1.5) return { label: "Low vibration", color: "#FF9F1C" };
    if (mag < 2.5) return { label: "Moderate shake", color: "#FF6B35" };
    return { label: "Strong shake", color: "#FF4D4F" };
  };

  const { label, color } = getShakeLabel(magnitude);

  return (
    <View style={styles.toolSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Accelerometer
      </Text>

      <View style={[styles.accelCard, { backgroundColor: colors.card }]}>
        <View style={styles.accelMagRow}>
          <Text style={[styles.accelMagValue, { color: colors.text }]}>
            {magnitude.toFixed(2)}
          </Text>
          <Text style={[styles.accelMagUnit, { color: colors.subtext }]}>
            m/s²
          </Text>
        </View>

        <View style={[styles.shakeBadge, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.shakeLabel, { color }]}>{label}</Text>
        </View>

        <View style={styles.accelAxes}>
          {(["x", "y", "z"] as const).map((axis) => (
            <View key={axis} style={styles.axisRow}>
              <Text style={[styles.axisLabel, { color: colors.subtext }]}>
                {axis.toUpperCase()}
              </Text>
              <Text style={[styles.axisValue, { color: colors.text }]}>
                {data[axis].toFixed(3)}
              </Text>
            </View>
          ))}
        </View>

        {peak > 0 && (
          <Text style={styles.peakText}>Peak: {peak.toFixed(2)} m/s²</Text>
        )}

        <Pressable
          style={[styles.accelButton, recording && styles.accelButtonStop]}
          onPress={toggleRecording}
        >
          <Text style={styles.accelButtonText}>
            {recording ? "Stop Recording" : "Start Recording"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function ChallengeDetailsScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Challenge Details",
      headerBackTitle: "Back",
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: "800" },
      headerRight: () => (
        <Pressable style={styles.headerIcon}>
          <Ionicons name="share-social-outline" size={20} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation, colors]);

  useEffect(() => {
    loadChallenge();
  }, [id]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const challengeId = Array.isArray(id) ? id[0] : id;
      if (!challengeId) {
        setChallenge(null);
        return;
      }
      const snapshot = await getDoc(doc(db, "challenges", challengeId));
      if (!snapshot.exists()) {
        setChallenge(null);
        return;
      }
      setChallenge({
        id: snapshot.id,
        ...(snapshot.data() as Omit<Challenge, "id">),
      });
    } catch (error) {
      console.log("Error loading challenge:", error);
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.screen,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator color="#5B2EEA" size="large" />
        <Text style={[styles.loadingText, { color: colors.subtext }]}>
          Loading challenge...
        </Text>
      </View>
    );
  }

  if (!challenge) {
    return (
      <View
        style={[
          styles.screen,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={44} color="#FF4D4F" />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Challenge not found
        </Text>
        <Text style={[styles.errorText, { color: colors.subtext }]}>
          This challenge could not be loaded from Firebase.
        </Text>
      </View>
    );
  }

  const tasks = challenge.tasks ?? [];
  const showReaction = challenge.id === "3";
  const showAccelerometer = challenge.id === "4";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: `${challenge.color}18` },
            ]}
          >
            <MaterialCommunityIcons
              name={challenge.icon as any}
              size={48}
              color={challenge.color}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {challenge.title}
          </Text>
          <Text style={[styles.description, { color: colors.subtext }]}>
            {challenge.description}
          </Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: `${challenge.color}18` },
              ]}
            >
              <Text style={[styles.badgeText, { color: challenge.color }]}>
                {challenge.priority} Priority
              </Text>
            </View>
            <View
              style={[styles.badge, { backgroundColor: colors.background }]}
            >
              <Text
                style={[styles.secondaryBadgeText, { color: colors.subtext }]}
              >
                {challenge.difficulty ?? "Activity"}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Challenge Details
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#5B2EEA" />
              <View>
                <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                  Due Date
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {challenge.due}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="layers-outline" size={20} color="#5B2EEA" />
              <View>
                <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                  Category
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {challenge.category ?? "STEMM Activity"}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color="#5B2EEA" />
              <View>
                <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                  Difficulty
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {challenge.difficulty ?? "Beginner"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tasks
          </Text>
          <View style={[styles.tasksCard, { backgroundColor: colors.card }]}>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <View key={`${task}-${index}`} style={styles.taskRow}>
                  <View style={styles.taskCircle}>
                    <Text style={styles.taskNumber}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.taskText, { color: colors.text }]}>
                    {task}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.subtext }]}>
                No task steps found for this challenge yet.
              </Text>
            )}
          </View>
        </View>

        {showReaction && <ReactionBoardTool colors={colors} />}
        {showAccelerometer && <AccelerometerTool colors={colors} />}
      </ScrollView>

      <Link href="/tasks/add" asChild>
        <Pressable style={styles.submitButton}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Submit Result</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "900",
  },
  errorText: {
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  content: { padding: 20, paddingBottom: 120 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  heroIcon: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
  },
  badgeRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  badgeText: { fontSize: 12, fontWeight: "800" },
  secondaryBadgeText: { fontSize: 12, fontWeight: "700" },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 22,
    padding: 18,
    gap: 18,
  },
  infoRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  infoLabel: { fontSize: 12 },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  tasksCard: {
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  taskCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5B2EEA",
    alignItems: "center",
    justifyContent: "center",
  },
  taskNumber: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  taskText: { flex: 1, fontSize: 14, fontWeight: "600" },
  submitButton: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 20,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#5B2EEA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  toolSection: { marginBottom: 18 },
  reactionBox: {
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    minHeight: 160,
  },
  reactionEmoji: { fontSize: 40, marginBottom: 12 },
  reactionLabel: { fontSize: 22, fontWeight: "900", color: "#FFFFFF" },
  reactionSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 8 },
  resultsCard: {
    borderRadius: 22,
    padding: 18,
    gap: 10,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  resultRow: { flexDirection: "row", justifyContent: "space-between" },
  resultLabel: { fontSize: 14 },
  resultValue: { fontSize: 14, fontWeight: "700" },
  resultAvgRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultAvgLabel: { fontSize: 14, fontWeight: "800", color: "#5B2EEA" },
  resultAvgValue: { fontSize: 14, fontWeight: "900", color: "#5B2EEA" },
  accelCard: {
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    gap: 14,
  },
  accelMagRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  accelMagValue: { fontSize: 48, fontWeight: "900" },
  accelMagUnit: { fontSize: 16, fontWeight: "700" },
  shakeBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  shakeLabel: { fontSize: 13, fontWeight: "800" },
  accelAxes: { flexDirection: "row", gap: 20 },
  axisRow: { alignItems: "center", gap: 4 },
  axisLabel: { fontSize: 12, fontWeight: "800" },
  axisValue: { fontSize: 14, fontWeight: "700" },
  peakText: { fontSize: 13, color: "#FF9F1C", fontWeight: "700" },
  accelButton: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    backgroundColor: "#5B2EEA",
    alignItems: "center",
    justifyContent: "center",
  },
  accelButtonStop: { backgroundColor: "#FF4D4F" },
  accelButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
