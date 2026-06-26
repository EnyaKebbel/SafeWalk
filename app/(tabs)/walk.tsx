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
import * as Location from 'expo-location';
import {
  Coordinates,
  getRouteSuggestion,
  RouteSuggestion,
  TransportMode,
} from "../../src/services/routeService";
import { startActiveWalk } from "../../src/services/walkService";

// Holt den aktuellen Standort als Startpunkt fuer die spaetere Routenberechnung.
async function getCurrentPosition(): Promise<Coordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error("Location access is needed for an automatic route estimate. You can still enter your own time.");
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    throw new Error("Could not fetch current location. Please ensure location services are enabled.");
  }
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
    mode: TransportMode,
    applySuggestion: (values: WalkFormValues) => void
  ) => {
    setIsEstimating(true);
    setSuggestionError("");

    try {
      const origin = await getCurrentPosition();
      const suggestion = await getRouteSuggestion(
        destination.trim(),
        origin,
        mode
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
