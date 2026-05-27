import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AboutStemmScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "About STEMM Lab",
      headerStyle: { backgroundColor: "#F7F4FF" },
      headerShadowVisible: false,
      headerTintColor: "#1D1828",
      headerTitleStyle: { fontWeight: "800" },
    });
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Ionicons name="information-circle-outline" size={36} color="#5B2EEA" />
        <Text style={styles.title}>About STEMM Lab</Text>
        <Text style={styles.text}>
          STEMM Lab helps student teams complete real-world Science, Technology,
          Engineering, Mathematics and Medicine challenges using mobile device
          features.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F4FF", padding: 18 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 22 },
  title: { fontSize: 24, fontWeight: "900", color: "#1D1828", marginTop: 14 },
  text: { fontSize: 14, color: "#7A7288", lineHeight: 22, marginTop: 8 },
});
