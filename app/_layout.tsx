import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { colors } from "../src/constants/theme";

SplashScreen.preventAutoHideAsync()

// Root-Layout fuer die gesamte App und die gemeinsame Navigation.
export default function RootLayout() {
    const [loaded, error] = useFonts({
        "nunito-regular": require("../src/assets/fonts/Nunito-Regular.ttf"),
        "nunito-bold": require("../src/assets/fonts/Nunito-Bold.ttf"),
    });

    // Splash Screen bleibt sichtbar, bis die Schrift geladen ist.
    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

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
                fontFamily: "nunito-bold",
            },
        }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
