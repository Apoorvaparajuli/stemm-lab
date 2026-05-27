import { useEffect, useState } from "react";
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
  getSubmissionsByTeam,
  getTeamDocument,
  getUserDocument,
  SubmissionDocument,
  TeamDocument,
  UserDocument,
} from "../../lib/firestore";

export default function ProfileScreen() {
  const { user } = useAuth();

  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [teamData, setTeamData] = useState<TeamDocument | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // Load user data
      const uData = await getUserDocument(user!.uid);
      setUserData(uData);

      // Load team data using teamId
      if (uData?.teamId) {
        const tData = await getTeamDocument(uData.teamId);
        setTeamData(tData);

        // Load submissions for this team
        const sData = await getSubmissionsByTeam(uData.teamId);
        setSubmissions(sData);
      }
    } catch (err) {
      console.log("Error loading profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color="#2563EB" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={loadProfile}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  const initials = teamData?.teamName
    ? teamData.teamName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Team Card */}
      <View style={styles.teamCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.teamName}>{teamData?.teamName || "No Team"}</Text>
        <Text style={styles.teamCode}>
          Team Code: {teamData?.teamCode || "N/A"}
        </Text>
        <Text style={styles.yearLevel}>
          {teamData?.yearLevel || "No year level"}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{submissions.length}</Text>
          <Text style={styles.statLabel}>Submissions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{teamData?.members?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {userData?.role === "student" ? "🎓" : "👨‍🏫"}
          </Text>
          <Text style={styles.statLabel}>{userData?.role || "student"}</Text>
        </View>
      </View>

      {/* Team Members */}
      <Text style={styles.sectionTitle}>Team Members</Text>
      <View style={styles.card}>
        {(teamData?.members || []).length === 0 ? (
          <Text style={styles.emptyText}>No members found.</Text>
        ) : (
          teamData?.members?.map((member, index) => (
            <View key={index} style={styles.memberRow}>
              <View style={styles.memberIcon}>
                <Text style={styles.memberInitial}>
                  {member[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{member}</Text>
                <Text style={styles.memberRole}>
                  {index === 0 ? "Team Lead" : "Team Member"}
                </Text>
              </View>
              <Text style={{ color: "#25B46B", fontSize: 18 }}>✓</Text>
            </View>
          ))
        )}
      </View>

      {/* Recent Submissions */}
      <Text style={styles.sectionTitle}>Recent Submissions</Text>
      <View style={styles.card}>
        {submissions.length === 0 ? (
          <Text style={styles.emptyText}>No submissions yet.</Text>
        ) : (
          submissions.slice(0, 3).map((sub, index) => (
            <View key={index} style={styles.submissionRow}>
              <Text style={styles.submissionTitle}>{sub.challengeTitle}</Text>
              <Text style={styles.submissionSummary}>{sub.resultSummary}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F4FF" },
  content: { padding: 18, paddingBottom: 40 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  loadingText: { fontSize: 14, color: "#7A7288", fontWeight: "600" },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
    textAlign: "center",
  },
  retryText: { fontSize: 13, color: "#2563EB", fontWeight: "700" },
  teamCard: {
    backgroundColor: "#5B2EEA",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 24, fontWeight: "900", color: "#5B2EEA" },
  teamName: { fontSize: 22, fontWeight: "900", color: "#FFFFFF" },
  teamCode: { fontSize: 13, color: "#EEE8FF", fontWeight: "700", marginTop: 4 },
  yearLevel: { fontSize: 12, color: "#EEE8FF", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "900", color: "#1D1828" },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7A7288",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1D1828",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  memberInitial: { fontSize: 16, fontWeight: "800", color: "#5B2EEA" },
  memberName: { fontSize: 14, fontWeight: "800", color: "#1D1828" },
  memberRole: { fontSize: 11, color: "#7A7288", marginTop: 2 },
  submissionRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDF8",
    paddingBottom: 10,
  },
  submissionTitle: { fontSize: 14, fontWeight: "800", color: "#1D1828" },
  submissionSummary: { fontSize: 12, color: "#7A7288", marginTop: 3 },
  emptyText: { fontSize: 13, color: "#7A7288", fontWeight: "600" },
});
