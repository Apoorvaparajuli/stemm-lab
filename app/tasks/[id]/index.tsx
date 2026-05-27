import React from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function ChallengeScreen() {
  // Placeholder backend values
  const submissionId = "submission_001";

  const challengeId = "challenge_001";

  const challengeTitle = "River Water Analysis";

  const teamId = "team_001";

  const gpsLocation = {
    latitude: -37.8136,
    longitude: 144.9631,
  };

  const createdAt = new Date().toISOString();

  const handleSubmit = () => {
    // Future Firebase submission object
    const submissionData = {
      submissionId,
      challengeId,
      challengeTitle,
      teamId,

      resultSummary: "Water quality moderate",

      observations: "High sediment near river bank",

      gpsLocation,

      createdAt,
    };

    console.log(submissionData);

    Alert.alert("Challenge Submitted", "Submission stored successfully.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenge Submission</Text>

      <TextInput style={styles.input} placeholder="Challenge Title" />

      <TextInput style={styles.input} placeholder="Result Summary" />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Observations"
        multiline
      />

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Challenge</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
