import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";

import React, { useState } from "react";
import { auth } from "../../firebaseConfig";

import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert("Success", "Logged in!");

      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/campuslogo.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>CampusMate</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

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
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Text style={styles.linkText}>
        Don't have an account?{" "}
        <Link href="/register" style={styles.link}>
          Register
        </Link>
      </Text>
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
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
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
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10,
  },
  linkText: { marginTop: 20, textAlign: "center", color: "#64748B" },
});
