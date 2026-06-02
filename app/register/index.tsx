import React, { useState } from "react";

import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../../firebaseConfig";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,

        email: user.email,

        firstName: firstName,

        teamId: "",

        role: "student",

        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created!");

      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Back to login</Text>
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
  link: {
    marginTop: 20,
    color: "#2563EB",
    textAlign: "center",
    fontWeight: "600",
  },
});
