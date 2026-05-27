import * as Notifications from "expo-notifications";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { auth } from "../lib/firebase";
import {
  configureNotifications,
  requestNotificationPermission,
  saveNotificationPreference,
  scheduleDailyReminder,
} from "../lib/notifications";

configureNotifications();

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
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
    if (!user) return;

    const setup = async () => {
      const granted = await requestNotificationPermission();
      await saveNotificationPreference(user.uid, granted);
      if (granted) await scheduleDailyReminder();
    };

    setup();

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
    if (!ready) return;
    const publicRoutes = ["/login", "/register"];
    const isPublic = publicRoutes.includes(pathname);
    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }
    if (user && isPublic) {
      router.replace("/home");
    }
  }, [ready, user, pathname, router]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#2563EB" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#F8FAFC" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login/index" options={{ headerShown: false }} />
        <Stack.Screen name="register/index" options={{ title: "Register" }} />
        <Stack.Screen name="home/index" options={{ title: "STEMM Lab" }} />
        <Stack.Screen name="tasks/index" options={{ title: "Challenges" }} />
        <Stack.Screen
          name="tasks/add/index"
          options={{ title: "Submit Result" }}
        />
        <Stack.Screen
          name="tasks/[id]/index"
          options={{ title: "Challenge Details" }}
        />
        <Stack.Screen name="resources/index" options={{ title: "Resources" }} />
        <Stack.Screen name="map/index" options={{ title: "Map" }} />
        <Stack.Screen name="safety/index" options={{ title: "Safety" }} />
        <Stack.Screen name="profile/index" options={{ title: "Profile" }} />
        <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
        <Stack.Screen
          name="settings/edit/index"
          options={{ title: "Edit Profile" }}
        />
        <Stack.Screen name="test/index" options={{ title: "Firestore Test" }} />
      </Stack>
    </>
  );
}
