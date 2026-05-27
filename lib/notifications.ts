import * as Notifications from "expo-notifications";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const saveNotificationPreference = async (
  uid: string,
  enabled: boolean,
) => {
  await setDoc(
    doc(db, "users", uid),
    { notificationsEnabled: enabled },
    { merge: true },
  );
};

export const scheduleDailyReminder = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "STEMM Lab",
      body: "You have upcoming challenges to complete!",
      data: { url: "/tasks" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24,
      repeats: true,
    },
  });
};

export const scheduleTestReminder = async (seconds: number = 10) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "STEMM Reminder",
      body: "Time to complete your STEMM challenge!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
};

export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
