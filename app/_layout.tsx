import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as TaskManager from "expo-task-manager";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useColorScheme } from "react-native";
import "react-native-reanimated";

import { auth, db } from "../lib/firebase";
import { ThemeProvider } from "../lib/ThemeContext";

const BACKGROUND_TASK = "check-challenge-reminders";

// ─── Background Task ───────────────────────────────────────────────────────
TaskManager.defineTask(BACKGROUND_TASK, async () => {
  console.log("Background task: checking challenge reminders");
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

const registerBackgroundTask = async () => {
  try {
    const isRegistered =
      await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
        minimumInterval: 60 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Background task registered");
    }
  } catch (error) {
    console.log("Background task registration failed:", error);
  }
};

// ─── Notification Handler ──────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const registerForNotificationsAsync = async (userId: string) => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus === "undetermined") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return;
    }

    console.log(
      "Notification permissions granted — local notifications active",
    );

    await setDoc(
      doc(db, "users", userId),
      { notificationsEnabled: true },
      { merge: true },
    );
  } catch (error) {
    console.log("Notification registration failed:", error);
  }
};

const scheduleChallengeReminder = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "STEMM Lab",
        body: "You have upcoming challenges to complete!",
        sound: true,
        data: { url: "/tasks" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: true,
      },
    });

    console.log("Challenge reminder scheduled");
  } catch (error) {
    console.log("Notification scheduling failed:", error);
  }
};

// ─── Root Layout ───────────────────────────────────────────────────────────
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    registerBackgroundTask();
  }, []);

  useEffect(() => {
    if (!user) return;

    registerForNotificationsAsync(user.uid);
    scheduleChallengeReminder();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const url = response.notification.request.content.data?.url as
          | string
          | undefined;
        if (url?.startsWith("/")) {
          router.push(url as any);
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user, router]);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const url = response?.notification.request.content.data?.url as
        | string
        | undefined;
      if (url?.startsWith("/")) {
        router.push(url as any);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!ready) return;

    const isSignedIn = !!user;
    const isPublicRoute =
      pathname === "/welcome" ||
      pathname === "/login" ||
      pathname === "/register";

    if (!isSignedIn && !isPublicRoute && pathname !== "/welcome") {
      router.replace("/welcome");
      return;
    }

    if (isSignedIn && isPublicRoute) {
      router.replace("/home");
    }
  }, [ready, user, pathname, router]);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <NavigationThemeProvider
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="home" />
          <Stack.Screen name="tasks" />
          <Stack.Screen name="map" />
          <Stack.Screen name="safety" />
          <Stack.Screen name="resources" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="submissions" />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
