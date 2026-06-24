import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import { colors } from '../../src/constants/theme';

export default function TabLayout() {
  return (
    // Gemeinsames Styling fuer Header und Tab-Bar, damit alle Tabs einheitlich wirken.
    <Tabs screenOptions={{  headerStyle: {
            backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "SafeWalk",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="walk"
        options={{
          title: "Walk",
          headerTitle: "Walk",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="walk-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          headerTitle: "Contacts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
