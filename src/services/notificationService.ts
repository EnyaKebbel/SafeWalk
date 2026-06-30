import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { getNotificationsEnabled } from "./settingsService";

// Notification-Service: fragt Rechte ab und plant die Walk-Erinnerung.

const WALK_REMINDER_CHANNEL_ID = "walk-reminders";
const ONE_MINUTE_IN_MS = 60 * 1000;
const MIN_SCHEDULE_DELAY_MS = 5 * 1000;

type NotificationPermissionResult = {
  status?: string;
  granted?: boolean;
  ios?: {
    status?: Notifications.IosAuthorizationStatus;
  };
};

// Sorgt dafür, dass lokale Notifications auch im Vordergrund sichtbar sind.
export function configureNotificationPresentation() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

function hasNotificationPermission(permission: NotificationPermissionResult) {
  return (
    permission.granted === true ||
    permission.status === "granted" ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function ensureNotificationPermissions() {
  // Erst vorhandene Rechte prüfen, danach nur bei Bedarf aktiv fragen.
  const currentPermissions =
    (await Notifications.getPermissionsAsync()) as NotificationPermissionResult;

  if (hasNotificationPermission(currentPermissions)) {
    return true;
  }

  const requestedPermissions =
    (await Notifications.requestPermissionsAsync()) as NotificationPermissionResult;
  return hasNotificationPermission(requestedPermissions);
}

async function ensureWalkReminderChannel() {
  // Android braucht einen Channel, damit Ton/Vibration wie gewünscht funktionieren.
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(WALK_REMINDER_CHANNEL_ID, {
    name: "Walk reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 350, 180, 350],
    enableVibrate: true,
    sound: "default",
  });
}

// Plant die diskrete Erinnerung eine Minute vor Ablauf des Walk-Timers.
export async function scheduleWalkReminderNotification(endsAt: string) {
  const notificationsEnabled = await getNotificationsEnabled();

  if (!notificationsEnabled) {
    return null;
  }

  const triggerDate = new Date(new Date(endsAt).getTime() - ONE_MINUTE_IN_MS);

  if (triggerDate.getTime() - Date.now() < MIN_SCHEDULE_DELAY_MS) {
    return null;
  }

  const hasPermission = await ensureNotificationPermissions();

  if (!hasPermission) {
    return null;
  }

  await ensureWalkReminderChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "SafeWalk is still active",
      body: "Tap to check your walk status.",
      sound: "default",
      vibrate: [0, 350, 180, 350],
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: {
        type: "walk-reminder",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: WALK_REMINDER_CHANNEL_ID,
    },
  });
}

export async function cancelWalkReminderNotification(notificationId?: string) {
  if (!notificationId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
