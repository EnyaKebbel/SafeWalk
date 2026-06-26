import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing } from "../../src/constants/theme";
import SettingsItem from "../../src/components/settings/SettingsItem";

const NOTIFICATION_STORAGE_KEY = "@settings_notifications_enabled";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Beim Starten der Seite laden wir den gespeicherten Zustand
    const loadSettings = async () => {
      try {
        const savedState = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
        if (savedState !== null) {
          setNotificationsEnabled(savedState === "true");
        }
      } catch (error) {
        console.error("Fehler beim Laden der Einstellungen:", error);
      }
    };
    
    loadSettings();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      // Speichere die neue Einstellung sofort lokal auf dem Handy
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, value.toString());
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
    }
  };

  const openLegal = () => {
    // Navigiert zur neuen Unterseite
    router.push("/legal");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize the app to your needs</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <SettingsItem
            icon="notifications"
            title="Notifications"
            description="Allow push messages for emergencies"
            type="switch"
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <SettingsItem
            icon="document-text"
            title="Legal"
            description="Information about the student project"
            type="link"
            onPress={openLegal}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
});
