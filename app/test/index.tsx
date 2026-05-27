import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import {
    createSubmission,
    getSubmissionsByTeam,
    getTeamDocument,
    getUserDocument,
} from "../../lib/firestore";

export default function FirestoreTestScreen() {
  const { user } = useAuth();
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const log = (msg: string) =>
    setResults((prev) => [
      `${new Date().toLocaleTimeString()} — ${msg}`,
      ...prev,
    ]);

  const testReadUser = async () => {
    try {
      setLoading(true);
      const data = await getUserDocument(user!.uid);
      if (data) {
        log(`✅ User read: ${data.firstName}, role: ${data.role}`);
      } else {
        log("❌ User document not found");
      }
    } catch (err: any) {
      log(`❌ User read failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testReadTeam = async () => {
    try {
      setLoading(true);
      const userData = await getUserDocument(user!.uid);
      if (!userData?.teamId) {
        log("❌ No teamId on user");
        return;
      }
      const team = await getTeamDocument(userData.teamId);
      if (team) {
        log(`✅ Team read: ${team.teamName}, members: ${team.members.length}`);
      } else {
        log("❌ Team document not found");
      }
    } catch (err: any) {
      log(`❌ Team read failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWriteSubmission = async () => {
    try {
      setLoading(true);
      const userData = await getUserDocument(user!.uid);
      if (!userData?.teamId) {
        log("❌ No teamId on user");
        return;
      }

      const id = await createSubmission({
        challengeId: "test-challenge-001",
        challengeTitle: "Firestore Test Challenge",
        teamId: userData.teamId,
        resultSummary: "Test result from Firestore test screen",
        observations: "This is a test observation to verify Firestore writes.",
        gpsLocation: { latitude: -37.8136, longitude: 144.9631 },
      });
      log(`✅ Submission written: ID ${id}`);
    } catch (err: any) {
      log(`❌ Submission write failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testReadSubmissions = async () => {
    try {
      setLoading(true);
      const userData = await getUserDocument(user!.uid);
      if (!userData?.teamId) {
        log("❌ No teamId on user");
        return;
      }
      const subs = await getSubmissionsByTeam(userData.teamId);
      log(`✅ Submissions read: ${subs.length} found for team`);
    } catch (err: any) {
      log(`❌ Submissions read failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Firestore Test</Text>
      <Text style={styles.subtitle}>
        Test Firestore reads and writes for your Firebase setup.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Read Tests</Text>
        <TestButton
          label="Read User Profile"
          onPress={testReadUser}
          color="#2563EB"
        />
        <TestButton
          label="Read Team Data"
          onPress={testReadTeam}
          color="#2563EB"
        />
        <TestButton
          label="Read Submissions"
          onPress={testReadSubmissions}
          color="#2563EB"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Write Tests</Text>
        <TestButton
          label="Write Test Submission"
          onPress={testWriteSubmission}
          color="#5B2EEA"
        />
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>Running test...</Text>
        </View>
      )}

      {results.length > 0 && (
        <View style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>Results</Text>
            <Pressable onPress={clearResults}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          </View>
          {results.map((r, i) => (
            <Text
              key={i}
              style={[styles.resultRow, r.includes("❌") && styles.resultError]}
            >
              {r}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function TestButton({
  label,
  onPress,
  color,
}: {
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      style={[styles.btn, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F4FF" },
  content: { padding: 18, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "900", color: "#1D1828", marginBottom: 4 },
  subtitle: {
    fontSize: 13,
    color: "#7A7288",
    marginBottom: 20,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1D1828",
    marginBottom: 4,
  },
  btn: { padding: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  loadingText: { color: "#7A7288", fontSize: 13 },
  resultsCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16 },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clearText: { color: "#EF4444", fontWeight: "700", fontSize: 13 },
  resultRow: {
    fontSize: 12,
    color: "#1D1828",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDF8",
    fontFamily: "monospace",
  },
  resultError: { color: "#EF4444" },
});
