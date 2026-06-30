import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import { Text, View } from "react-native";
import { colors } from '../../src/constants/theme';

// Setzt Header Logo & Icon
function HeaderLogo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
      <Text style={{ fontFamily: 'righteous-regular', fontSize: 24, color: colors.text, marginBottom: -2 }}>
        SafeWalk
      </Text>
    </View>
  );
}

// Definiert Tab-Navigation
export default function TabLayout() {
  return (
    // Gemeinsames Styling für Header und Tab-Bar.
    <Tabs screenOptions={{  
        headerStyle: {
            backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitle: () => <HeaderLogo />,
        headerTitleAlign: 'center',
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="walk"
        options={{
          title: "Walk",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="walk-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
