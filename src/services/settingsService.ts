import AsyncStorage from "@react-native-async-storage/async-storage";

// Speichern & laden von Notification-Einstellungen lokal mit AsyncStorage

const NOTIFICATION_STORAGE_KEY = "@settings_notifications_enabled";

export async function getNotificationsEnabled() {
    const savedState = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return savedState === "true";
}

export async function setNotificationsEnabled(value: boolean) {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, value.toString());
}
