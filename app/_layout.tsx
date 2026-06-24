import { Stack } from "expo-router";
import { colors } from '../src/constants/theme';

// Root-Layout fuer die gesamte App und die gemeinsame Navigation.
export default function RootLayout() {
  return (
    <Stack
        screenOptions={{
            contentStyle: {
                backgroundColor: colors.background,
            },
            headerStyle: {
                backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
