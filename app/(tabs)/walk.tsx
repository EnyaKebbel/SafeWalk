import React, { useState, useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as SMS from 'expo-sms';
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
import { ActiveWalk, clearActiveWalk, getActiveWalk, startActiveWalk } from "../../src/services/walkService";
import ActiveWalkTracker from "../../src/components/walk/ActiveWalkTracker";
import NotifyContactModal from "../../src/components/modals/NotifyContactModal";
import { TrustedContact } from "../../src/services/contactService";
import {
  triggerImpactHaptic,
  triggerSuccessHaptic,
} from "../../src/services/hapticsService";

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
  const [routeSuggestion, setRouteSuggestion] = useState<RouteSuggestion | null>(null);
  const [suggestionError, setSuggestionError] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  
  const [activeWalk, setActiveWalk] = useState<ActiveWalk | null>(null);

  const loadActiveWalk = useCallback(async () => {
      const walk = await getActiveWalk();
      setActiveWalk(walk);
  }, []);

  useFocusEffect(
      useCallback(() => {
          loadActiveWalk();
      }, [loadActiveWalk])
  );

  const [notifyModalVisible, setNotifyModalVisible] = useState(false);

  const handleArrivedSafely = () => {
      triggerSuccessHaptic();
      setNotifyModalVisible(true);
  };

  const finishWalkAndClose = async () => {
      setNotifyModalVisible(false);
      await clearActiveWalk();
      setActiveWalk(null);
  };

  const handleNotifyContact = async (contacts: TrustedContact[]) => {
      const message = "I just arrived safely at my destination!";
      const phoneNumbers = contacts.map(c => c.contactNumber);
      
      try {
          // @ts-ignore
          const isAvailable = await SMS.isAvailableAsync();
          if (isAvailable) {
              // @ts-ignore
              await SMS.sendSMSAsync(phoneNumbers, message);
          } else {
              console.error("SMS is not available on this device");
              alert("SMS not available: " + phoneNumbers.join(", "));
          }
      } catch (e) {
          console.error("Could not open SMS app", e);
      }
      
      finishWalkAndClose();
  };

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
    triggerImpactHaptic();

    await startActiveWalk({
      destination: values.destination.trim(),
      estimatedMinutes: parsedMinutes,
      routeSuggestion: routeSuggestion ?? undefined,
    });

    setRouteSuggestion(null); // Verhindert, dass die alte Zeit beim naechsten Walk angezeigt wird
    router.replace("/");
  };

  if (activeWalk) {
    return (
        <>
            <ActiveWalkTracker 
                activeWalk={activeWalk}
                onEndWalk={handleArrivedSafely}
            />
            <NotifyContactModal
                visible={notifyModalVisible}
                onClose={() => setNotifyModalVisible(false)}
                onSelectContacts={handleNotifyContact}
                onSkip={finishWalkAndClose}
            />
        </>
    );
  }

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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
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
});
