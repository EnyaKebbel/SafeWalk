import { Stack } from "expo-router";
import { router } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { colors } from "../src/constants/theme";
import * as Notifications from "expo-notifications";
import { configureNotificationPresentation } from "../src/services/notificationService";
import { useWalkAlarm } from "../src/hooks/useWalkAlarm";

SplashScreen.preventAutoHideAsync()
configureNotificationPresentation();

// Root-Layout für die gesamte App und Stack-Navigation.
export default function RootLayout() {
    // Globaler Walk-Alarm: prueft auch dann weiter, wenn der User den Screen wechselt.
    useWalkAlarm();

    // Schriften aus assets
    const [loaded, error] = useFonts({
        "nunito-regular": require("../src/assets/fonts/Nunito-Regular.ttf"),
        "nunito-bold": require("../src/assets/fonts/Nunito-Bold.ttf"),
        "righteous-regular": require("../src/assets/fonts/Righteous-Regular.ttf"),
    });

    // Splash Screen bleibt sichtbar, bis die Schrift geladen ist.
    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    useEffect(() => {
        const subscription =
            Notifications.addNotificationResponseReceivedListener((response) => {
                if (
                    response.notification.request.content.data?.type ===
                    "walk-reminder"
                ) {
                    router.replace("/");
                }
            });

        return () => subscription.remove();
    }, []);

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
