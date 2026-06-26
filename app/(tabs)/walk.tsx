import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { colors, spacing } from "../../src/constants/theme";
import RouteSuggestionCard from "../../src/components/walk/RouteSuggestionCard";
import WalkDestinationForm, {
  WalkFormValues,
} from "../../src/components/walk/WalkDestinationForm";
import WalkSafetyNotice from "../../src/components/walk/WalkSafetyNotice";
import {
  Coordinates,
  getWalkingRouteSuggestion,
  RouteSuggestion,
} from "../../src/services/routeService";
import { startActiveWalk } from "../../src/services/walkService";

// Holt den aktuellen Standort als Startpunkt fuer die spaetere Routenberechnung.
function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    const geolocation = (navigator as any)?.geolocation;

    if (!geolocation) {
      reject(
        new Error(
          "Location access is not available yet. You can still enter your own time."
        )
      );
      return;
    }

    geolocation.getCurrentPosition(
      (position: any) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () =>
        reject(
          new Error(
            "Location access is needed for an automatic route estimate."
          )
        ),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

// Walk-Screen for destination, route time and starting a safe walk.
export default function WalkScreen() {
  const [routeSuggestion, setRouteSuggestion] =
    useState<RouteSuggestion | null>(null);
  const [suggestionError, setSuggestionError] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);

  // Fragt OpenRouteService nach einer Gehzeit und uebernimmt sie als Vorschlag.
  const estimateRoute = async (
    destination: string,
    applySuggestion: (values: WalkFormValues) => void
  ) => {
    setIsEstimating(true);
    setSuggestionError("");

    try {
      const origin = await getCurrentPosition();
      const suggestion = await getWalkingRouteSuggestion(
        destination.trim(),
        origin
      );

      setRouteSuggestion(suggestion);
      applySuggestion({
        destination: suggestion.destinationLabel,
        minutes: String(suggestion.durationMinutes),
      });
    } catch (error) {
      setRouteSuggestion(null);
      setSuggestionError(
        error instanceof Error
          ? error.message
          : "Route estimate is currently unavailable."
      );
    } finally {
      setIsEstimating(false);
    }
  };

  // Speichert den aktiven Walk mit Endzeit und bringt den User zurueck zum Home Screen.
  const handleStartWalk = async (values: WalkFormValues) => {
    const parsedMinutes = Math.ceil(Number(values.minutes.replace(",", ".")));

    await startActiveWalk({
      destination: values.destination.trim(),
      estimatedMinutes: parsedMinutes,
      routeSuggestion: routeSuggestion ?? undefined,
    });

    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Start Walk</Text>
          <Text style={styles.subtitle}>
            Set your destination and the time you expect to arrive safely.
          </Text>
        </View>

        <WalkDestinationForm
          suggestionError={suggestionError}
          isEstimating={isEstimating}
          onDestinationChange={() => {
            setRouteSuggestion(null);
            setSuggestionError("");
          }}
          onEstimateRoute={estimateRoute}
          onSubmit={handleStartWalk}
        >
          {routeSuggestion ? (
            <RouteSuggestionCard suggestion={routeSuggestion} />
          ) : null}
          <WalkSafetyNotice />
        </WalkDestinationForm>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 30,
  },
  subtitle: {
    color: colors.mutedText,
    fontFamily: "nunito-regular",
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});
