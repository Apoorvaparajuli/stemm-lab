import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Battery from "expo-battery";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../lib/ThemeContext";

export default function SafetyScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [showTorch, setShowTorch] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

  const [soundRunning, setSoundRunning] = useState(false);
  const [soundLevel, setSoundLevel] = useState<number | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [permission, requestPermission] = useCameraPermissions();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Activity Tools & Safety",
      headerBackTitle: "Back",
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: "800" },
    });
  }, [navigation, colors]);

  useEffect(() => {
    getBattery();
    getGPS();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (stopwatchRunning) {
      timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [stopwatchRunning]);

  const getBattery = async () => {
    const level = await Battery.getBatteryLevelAsync();
    setBatteryLevel(Math.round(level * 100));
  };

  const getGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setGpsEnabled(status === "granted");
  };

  const toggleTorch = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera permission required",
          "Torch requires camera permission.",
        );
        return;
      }
    }
    setShowTorch(true);
    setTorchEnabled((prev) => !prev);
  };

  const formatTime = (value: number) => {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const toggleSoundMeter = async () => {
    if (soundRunning) {
      if (soundTimerRef.current) clearInterval(soundTimerRef.current);
      soundTimerRef.current = null;
      await recordingRef.current?.stopAndUnloadAsync();
      recordingRef.current = null;
      setSoundRunning(false);
      return;
    }

    const permissionResult = await Audio.requestPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Microphone permission required",
        "Sound meter requires microphone permission.",
      );
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      android: {
        extension: ".m4a",
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: ".m4a",
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
      isMeteringEnabled: true,
    });

    await recording.startAsync();
    recordingRef.current = recording;
    setSoundRunning(true);

    soundTimerRef.current = setInterval(async () => {
      const status = await recording.getStatusAsync();
      if ("metering" in status && typeof status.metering === "number") {
        const normalized = Math.max(
          0,
          Math.min(100, Math.round(status.metering + 100)),
        );
        setSoundLevel(normalized);
      }
    }, 500);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Device Status
        </Text>

        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
            <Ionicons name="battery-half" size={34} color="#25B46B" />
            <Text style={[styles.statusLabel, { color: colors.subtext }]}>
              Battery
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {batteryLevel !== null ? `${batteryLevel}%` : "--"}
            </Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
            <Ionicons name="location" size={34} color="#25B46B" />
            <Text style={[styles.statusLabel, { color: colors.subtext }]}>
              GPS
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {gpsEnabled ? "On" : "Off"}
            </Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
            <Ionicons name="mic" size={34} color="#3B82F6" />
            <Text style={[styles.statusLabel, { color: colors.subtext }]}>
              Sound
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {soundLevel !== null ? `${soundLevel}` : "--"}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Tools
        </Text>

        <View style={[styles.toolsCard, { backgroundColor: colors.card }]}>
          <Pressable
            style={[styles.toolRow, { borderBottomColor: colors.border }]}
            onPress={toggleTorch}
          >
            <View style={[styles.toolIcon, { backgroundColor: "#EEE5FF" }]}>
              <Ionicons name="flashlight" size={24} color="#6C3DEB" />
            </View>
            <View style={styles.toolTextWrap}>
              <Text style={[styles.toolTitle, { color: colors.text }]}>
                Torch
              </Text>
              <Text style={[styles.toolSubtitle, { color: colors.subtext }]}>
                {torchEnabled ? "Flashlight is on" : "Turn on flashlight"}
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color={colors.subtext} />
          </Pressable>

          <View style={[styles.toolRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.toolIcon, { backgroundColor: "#FFF1DD" }]}>
              <Ionicons name="timer" size={24} color="#FF9F1C" />
            </View>
            <View style={styles.toolTextWrap}>
              <Text style={[styles.toolTitle, { color: colors.text }]}>
                Stopwatch
              </Text>
              <Text style={[styles.toolSubtitle, { color: colors.subtext }]}>
                Time: {formatTime(seconds)}
              </Text>
            </View>
            <Pressable
              style={styles.smallButton}
              onPress={() => setStopwatchRunning((prev) => !prev)}
            >
              <Text style={styles.smallButtonText}>
                {stopwatchRunning ? "Pause" : "Start"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.smallButton, styles.resetButton]}
              onPress={() => {
                setStopwatchRunning(false);
                setSeconds(0);
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.toolRow, { borderBottomColor: colors.border }]}
            onPress={toggleSoundMeter}
          >
            <View style={[styles.toolIcon, { backgroundColor: "#E7FFF0" }]}>
              <MaterialCommunityIcons
                name="waveform"
                size={24}
                color="#25B46B"
              />
            </View>
            <View style={styles.toolTextWrap}>
              <Text style={[styles.toolTitle, { color: colors.text }]}>
                Sound Meter
              </Text>
              <Text style={[styles.toolSubtitle, { color: colors.subtext }]}>
                {soundRunning
                  ? `Listening... level ${soundLevel ?? "--"}`
                  : "Tap to measure sound level"}
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color={colors.subtext} />
          </Pressable>
        </View>
      </ScrollView>

      {showTorch && (
        <View style={styles.hiddenCamera}>
          <CameraView
            style={{ width: 1, height: 1 }}
            facing="back"
            enableTorch={torchEnabled}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 26,
  },
  statusCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 13,
    marginTop: 10,
    fontWeight: "700",
  },
  statusValue: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },
  toolsCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
  },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
  },
  toolIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  toolTextWrap: { flex: 1 },
  toolTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  toolSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  smallButton: {
    backgroundColor: "#5B2EEA",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    marginLeft: 6,
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  resetButton: { backgroundColor: "#F1EEFA" },
  resetButtonText: {
    color: "#5B2EEA",
    fontSize: 12,
    fontWeight: "800",
  },
  hiddenCamera: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});
