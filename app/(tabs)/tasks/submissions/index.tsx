import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import * as SQLite from "expo-sqlite";
import { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../../lib/ThemeContext";

type LocalSubmission = {
  id: number;
  challenge_title: string;
  team_name: string;
  result_summary: string;
  observations: string;
  evidence_type: string | null;
  latitude: number | null;
  longitude: number | null;
  synced: number;
  created_at: string;
};

const database = SQLite.openDatabaseSync("stemm_lab.db");

export default function LocalSubmissionsScreen() {
  const navigation = useNavigation();
  const [submissions, setSubmissions] = useState<LocalSubmission[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Local Cache",
      headerBackTitle: "Back",
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: "800" },
    });
  }, [navigation, colors]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    try {
      const rows = database.getAllSync(
        "SELECT * FROM submissions ORDER BY created_at DESC",
      ) as LocalSubmission[];
      setSubmissions(rows);
    } catch (error) {
      console.log("Error loading local submissions:", error);
      setSubmissions([]);
    }
  };

  const clearAll = () => {
    try {
      database.runSync("DELETE FROM submissions");
      setSubmissions([]);
    } catch (error) {
      console.log("Error clearing submissions:", error);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.card }]}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="server-outline" size={32} color="#5B2EEA" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          SQLite Local Cache
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
          Submissions stored locally on this device using SQLite. Data is synced
          to Firebase on submit.
        </Text>

        <View style={styles.statsRow}>
          <View
            style={[styles.statBox, { backgroundColor: colors.background }]}
          >
            <Text style={styles.statNumber}>{submissions.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>
              Total
            </Text>
          </View>
          <View
            style={[styles.statBox, { backgroundColor: colors.background }]}
          >
            <Text style={styles.statNumber}>
              {submissions.filter((s) => s.synced === 1).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>
              Synced
            </Text>
          </View>
          <View
            style={[styles.statBox, { backgroundColor: colors.background }]}
          >
            <Text style={styles.statNumber}>
              {submissions.filter((s) => s.synced === 0).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>
              Offline only
            </Text>
          </View>
        </View>
      </View>

      {submissions.length > 0 && (
        <Pressable style={styles.clearButton} onPress={clearAll}>
          <Ionicons name="trash-outline" size={16} color="#FF4D4F" />
          <Text style={styles.clearButtonText}>Clear All Local Data</Text>
        </Pressable>
      )}

      {submissions.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
          <Ionicons name="server-outline" size={40} color="#C4BDD8" />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No local submissions yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            When you submit a challenge result, it will be cached here locally
            as a backup.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {submissions.map((item) => {
            const isExpanded = expanded === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={() => setExpanded(isExpanded ? null : item.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text
                      style={[styles.challengeTitle, { color: colors.text }]}
                    >
                      {item.challenge_title}
                    </Text>
                    <Text style={styles.teamName}>{item.team_name}</Text>
                  </View>

                  <View style={styles.cardHeaderRight}>
                    <View
                      style={[
                        styles.syncBadge,
                        {
                          backgroundColor:
                            item.synced === 1 ? "#E9F8EF" : "#FFF3E0",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          item.synced === 1
                            ? "cloud-done-outline"
                            : "cloud-offline-outline"
                        }
                        size={12}
                        color={item.synced === 1 ? "#1F8F4D" : "#FF9F1C"}
                      />
                      <Text
                        style={[
                          styles.syncText,
                          {
                            color: item.synced === 1 ? "#1F8F4D" : "#FF9F1C",
                          },
                        ]}
                      >
                        {item.synced === 1 ? "Synced" : "Offline"}
                      </Text>
                    </View>

                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#9A94A6"
                      style={{ marginTop: 6 }}
                    />
                  </View>
                </View>

                <Text style={[styles.dateText, { color: colors.subtext }]}>
                  {formatDate(item.created_at)}
                </Text>

                {isExpanded && (
                  <View style={styles.expandedSection}>
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: colors.border },
                      ]}
                    />

                    <Text style={styles.fieldLabel}>Result Summary</Text>
                    <Text style={[styles.fieldValue, { color: colors.text }]}>
                      {item.result_summary}
                    </Text>

                    <Text style={styles.fieldLabel}>Observations</Text>
                    <Text style={[styles.fieldValue, { color: colors.text }]}>
                      {item.observations}
                    </Text>

                    {item.latitude !== null && item.longitude !== null ? (
                      <>
                        <Text style={styles.fieldLabel}>GPS Location</Text>
                        <View style={styles.gpsRow}>
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#5B2EEA"
                          />
                          <Text style={styles.gpsValue}>
                            {Number(item.latitude).toFixed(4)},{" "}
                            {Number(item.longitude).toFixed(4)}
                          </Text>
                        </View>
                      </>
                    ) : null}

                    {item.evidence_type ? (
                      <>
                        <Text style={styles.fieldLabel}>Evidence</Text>
                        <View
                          style={[
                            styles.evidenceBadge,
                            { backgroundColor: colors.background },
                          ]}
                        >
                          <Ionicons
                            name={
                              item.evidence_type === "video"
                                ? "videocam-outline"
                                : "image-outline"
                            }
                            size={14}
                            color={
                              item.evidence_type === "video"
                                ? "#3B82F6"
                                : "#25B46B"
                            }
                          />
                          <Text
                            style={[
                              styles.evidenceBadgeText,
                              {
                                color:
                                  item.evidence_type === "video"
                                    ? "#3B82F6"
                                    : "#25B46B",
                              },
                            ]}
                          >
                            {item.evidence_type === "video"
                              ? "Video attached"
                              : "Photo attached"}
                          </Text>
                        </View>
                      </>
                    ) : null}

                    <View style={styles.idRow}>
                      <Text style={styles.idText}>Local ID: {item.id}</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <Ionicons name="information-circle-outline" size={20} color="#5B2EEA" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            About Local Storage
          </Text>
          <Text style={[styles.infoText, { color: colors.subtext }]}>
            STEMM Lab uses SQLite to cache submissions locally on your device.
            This ensures your results are never lost even without an internet
            connection. Data marked as "Synced" has been successfully saved to
            Firebase Firestore.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  headerCard: {
    borderRadius: 26,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  headerIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    width: "100%",
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#5B2EEA",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFD4D4",
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FF4D4F",
  },
  emptyBox: {
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  list: { gap: 14, marginBottom: 16 },
  card: {
    borderRadius: 22,
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: { flex: 1, marginRight: 10 },
  cardHeaderRight: { alignItems: "flex-end", gap: 4 },
  challengeTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  teamName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5B2EEA",
    marginTop: 3,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  syncText: { fontSize: 11, fontWeight: "800" },
  dateText: {
    fontSize: 12,
    marginTop: 8,
  },
  expandedSection: { marginTop: 4 },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9A94A6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gpsValue: {
    fontSize: 14,
    color: "#5B2EEA",
    fontWeight: "700",
  },
  evidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  evidenceBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  idRow: { marginTop: 12 },
  idText: {
    fontSize: 11,
    color: "#C4BDD8",
    fontWeight: "700",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    padding: 14,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
