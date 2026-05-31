import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../lib/ThemeContext";

const challenges = [
  {
    id: "1",
    title: "Parachute Drop",
    subtitle: "Science Building",
    latitude: -37.7207,
    longitude: 145.0482,
    color: "#5B2EEA",
    icon: "parachute",
  },
  {
    id: "2",
    title: "Sound Pollution",
    subtitle: "Agora Walkway",
    latitude: -37.7215,
    longitude: 145.0474,
    color: "#25B46B",
    icon: "volume-high",
  },
  {
    id: "3",
    title: "Hand Fan Test",
    subtitle: "Library Courtyard",
    latitude: -37.7214,
    longitude: 145.0486,
    color: "#FF9F1C",
    icon: "fan",
  },
  {
    id: "4",
    title: "Reaction Board",
    subtitle: "Sports Centre Area",
    latitude: -37.7188,
    longitude: 145.0459,
    color: "#3B82F6",
    icon: "gesture-tap",
  },
  {
    id: "5",
    title: "Earthquake Structure",
    subtitle: "Engineering / Technology Area",
    latitude: -37.7225,
    longitude: 145.0468,
    color: "#EF4444",
    icon: "office-building",
  },
];

export default function MapScreen() {
  const { colors } = useTheme();
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [mode, setMode] = useState<"map" | "list">("map");

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location permission denied",
        "Please allow location access to use the challenge map.",
      );
      return;
    }
    const current = await Location.getCurrentPositionAsync({});
    setLocation(current.coords);
  };

  const openDirections = (latitude: number, longitude: number) => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const center = {
    latitude: location?.latitude ?? -37.7207,
    longitude: location?.longitude ?? 145.0482,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={[styles.segmentWrap, { backgroundColor: colors.card }]}>
        <Pressable
          style={[styles.segment, mode === "map" && styles.segmentActive]}
          onPress={() => setMode("map")}
        >
          <Text
            style={[
              styles.segmentText,
              { color: colors.text },
              mode === "map" && styles.segmentActiveText,
            ]}
          >
            Map
          </Text>
        </Pressable>

        <Pressable
          style={[styles.segment, mode === "list" && styles.segmentActive]}
          onPress={() => setMode("list")}
        >
          <Text
            style={[
              styles.segmentText,
              { color: colors.text },
              mode === "list" && styles.segmentActiveText,
            ]}
          >
            List
          </Text>
        </Pressable>
      </View>

      {mode === "map" ? (
        <View
          style={[
            styles.mapWrap,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <MapView style={styles.map} region={center}>
            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="My Location"
                description="Current GPS position"
              >
                <View style={styles.userDotOuter}>
                  <View style={styles.userDotInner} />
                </View>
              </Marker>
            )}

            {challenges.map((item) => (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                title={item.title}
                description={item.subtitle}
              >
                <View style={styles.markerBubble}>
                  <View
                    style={[
                      styles.markerIconCircle,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={[styles.markerText, { color: item.color }]}>
                    {item.title}
                  </Text>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {challenges.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.listCard, { backgroundColor: colors.card }]}
              onPress={() => openDirections(item.latitude, item.longitude)}
            >
              <View
                style={[
                  styles.listIcon,
                  { backgroundColor: `${item.color}18` },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={28}
                  color={item.color}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.listSubtitle, { color: colors.subtext }]}>
                  {item.subtitle}
                </Text>
                <Text style={styles.listCoords}>
                  {item.latitude}, {item.longitude}
                </Text>
              </View>

              <Ionicons name="navigate" size={22} color="#5B2EEA" />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
        <View style={styles.locationLeft}>
          <Ionicons name="location-outline" size={24} color="#5B2EEA" />
          <View>
            <Text style={[styles.locationTitle, { color: colors.text }]}>
              My Location
            </Text>
            <Text style={[styles.locationSubtitle, { color: colors.subtext }]}>
              {location
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : "Getting GPS location..."}
            </Text>
          </View>
        </View>

        <Pressable style={styles.directionsButton} onPress={getLocation}>
          <Text style={styles.directionsText}>Refresh</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  segmentWrap: {
    height: 42,
    marginHorizontal: 95,
    marginTop: 14,
    marginBottom: 12,
    borderRadius: 22,
    flexDirection: "row",
    padding: 4,
    zIndex: 10,
  },
  segment: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: { backgroundColor: "#5B2EEA" },
  segmentText: {
    fontSize: 14,
    fontWeight: "800",
  },
  segmentActiveText: { color: "#FFFFFF" },
  mapWrap: {
    flex: 1,
    marginHorizontal: 18,
    marginBottom: 110,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
  },
  map: { flex: 1 },
  markerBubble: {
    minWidth: 138,
    maxWidth: 175,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#DDD3FF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  markerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  userDotOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(59,130,246,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  userDotInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#3B82F6",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 120,
    gap: 14,
  },
  listCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  listIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: { fontSize: 16, fontWeight: "800" },
  listSubtitle: { fontSize: 13, marginTop: 3 },
  listCoords: {
    fontSize: 12,
    color: "#5B2EEA",
    marginTop: 5,
    fontWeight: "700",
  },
  locationCard: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  locationTitle: { fontSize: 15, fontWeight: "800" },
  locationSubtitle: { fontSize: 12, marginTop: 3 },
  directionsButton: {
    backgroundColor: "#5B2EEA",
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  directionsText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
