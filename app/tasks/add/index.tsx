import React, { useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function AddTaskScreen() {
  const [title, setTitle] = useState("");

  const [difficulty, setDifficulty] = useState("");

  const [description, setDescription] = useState("");

  const handleAddTask = () => {
    const newTask = {
      id: Date.now().toString(),
      title,
      difficulty,
      description,
      createdAt: new Date().toISOString(),
    };

    console.log(newTask);

    Alert.alert("Task Added", "New STEM challenge created successfully.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add STEM Challenge</Text>

      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Difficulty (Easy / Medium / Hard)"
        value={difficulty}
        onChangeText={setDifficulty}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Task Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Pressable style={styles.button} onPress={handleAddTask}>
        <Text style={styles.buttonText}>Add Task</Text>
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
