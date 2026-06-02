import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { auth } from "../../lib/firebase";

const getLoginErrorMessage = (code?: string) => {
  if (code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }
  if (
    code === "auth/user-not-found" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-credential"
  ) {
    return "Incorrect email or password.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Check your internet and try again.";
  }
  return "Login failed. Please try again.";
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setEmailError("");
    setPasswordError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailError("Email is required.");
      return;
    }
    if (!password) {
      setPasswordError("Password is required.");
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      router.replace("/home");
    } catch (error: any) {
      console.log("Login error:", error);
      const message = getLoginErrorMessage(error?.code);
      if (error?.code === "auth/invalid-email") {
        setEmailError(message);
        return;
      }
      setPasswordError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logo}>
          <Ionicons name="flask" size={42} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Log in to continue your STEMM Lab activities.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !!emailError && styles.inputError]}
            placeholder="Enter email"
            placeholderTextColor="#A39BAD"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setEmailError("");
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, !!passwordError && styles.inputError]}
            placeholder="Enter password"
            placeholderTextColor="#A39BAD"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setPasswordError("");
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {!!passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          <Link href="/register" style={styles.link}>
            Don&apos;t have an account? Register
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: "#F7F4FF",
  },
  screen: {
    flexGrow: 1,
    padding: 22,
    justifyContent: "center",
  },
  logo: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: "#5B2EEA",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1D1828",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#7A7288",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D1828",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F7F4FF",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1D1828",
    borderWidth: 1,
    borderColor: "#E5DDF7",
  },
  inputError: {
    borderColor: "#FF4D4F",
    backgroundColor: "#FFF7F7",
  },
  errorText: {
    color: "#FF4D4F",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  button: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#5B2EEA",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  link: {
    color: "#5B2EEA",
    fontWeight: "800",
    textAlign: "center",
    marginTop: 18,
  },
});
