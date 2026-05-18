import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from "./api";

const ANNOUNCED_NOTIFICATION_IDS_KEY = "announcedNotificationIds";
const MAX_STORED_IDS = 200;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowSound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let pollingInterval = null;
let initialized = false;

async function ensurePermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const request = await Notifications.requestPermissionsAsync();
  return !!(request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL);
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
  });
}

async function loadAnnouncedIds() {
  try {
    const raw = await AsyncStorage.getItem(ANNOUNCED_NOTIFICATION_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAnnouncedIds(ids) {
  try {
    await AsyncStorage.setItem(
      ANNOUNCED_NOTIFICATION_IDS_KEY,
      JSON.stringify(ids.slice(0, MAX_STORED_IDS))
    );
  } catch {}
}

function buildNotificationText(notification) {
  const actorName = notification?.actorName || "New activity";

  switch (notification?.type) {
    case "like":
      return `${actorName} liked your video`;
    case "comment":
      return `${actorName} commented on your video`;
    case "follow":
      return `${actorName} started following you`;
    case "reply":
      return `${actorName} replied to your comment`;
    default:
      return `${actorName} ${notification?.message || "sent you a notification"}`.trim();
  }
}

async function announceUnreadNotifications() {
  try {
    const res = await api.get("/notifications");
    const notifications = res?.data?.notifications ?? [];
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const announcedIds = await loadAnnouncedIds();
    const knownIds = new Set(announcedIds);
    const freshUnread = unread.filter((n) => !knownIds.has(String(n.id)));

    for (const notification of freshUnread.reverse()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nawarny",
          body: buildNotificationText(notification),
          sound: "default",
          data: {
            notificationId: notification.id,
            type: notification.type,
            relatedId: notification.relatedId,
          },
        },
        trigger: null,
      });
      announcedIds.unshift(String(notification.id));
    }

    if (freshUnread.length > 0) {
      await saveAnnouncedIds(announcedIds);
    }
  } catch (error) {
    console.log("Foreground notification polling failed:", error?.message);
  }
}

export async function startForegroundNotificationPolling() {
  if (!initialized) {
    await ensureAndroidChannel();
    const granted = await ensurePermissions();
    if (!granted) return;
    initialized = true;
  }

  if (pollingInterval) return;

  await announceUnreadNotifications();
  pollingInterval = setInterval(() => {
    announceUnreadNotifications();
  }, 15000);
}

export function stopForegroundNotificationPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
