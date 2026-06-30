import { Platform, Vibration } from "react-native";
import * as Haptics from "expo-haptics";

// Haptics-Service: zentrales Feedback für Buttons, SOS und Erfolgsmeldungen.

type FallbackPattern = number | number[];

// Bewährtes Pattern, das auf dem Testgerät zuverlässig spürbar ist.
const BUTTON_HAPTIC_PATTERN: FallbackPattern = [0, 250, 120, 250];

// Führt Expo-Haptics aus und nutzt bei Fehlern eine einfache Vibration als Rückfall.
async function runHapticFeedback(
  feedback: () => Promise<void>,
  fallbackPattern?: FallbackPattern
) {
  try {
    await feedback();
  } catch {
    // Haptisches Feedback ist auf Simulatoren oder ohne Vibrationsmotor nicht immer verfügbar.
    if (Platform.OS !== "web" && fallbackPattern) {
      Vibration.vibrate(fallbackPattern);
    }
  }
}

function triggerAndroidVibration(pattern: FallbackPattern) {
  Vibration.vibrate(pattern);
}

// Kombiniert native Android-Haptics mit Vibration, damit der Klick sicher spürbar bleibt.
async function triggerAndroidHapticFeedback(
  type: Haptics.AndroidHaptics,
  pattern: FallbackPattern
) {
  triggerAndroidVibration(pattern);

  try {
    await Haptics.performAndroidHapticsAsync(type);
  } catch {
    // Falls die Android-Haptics-Engine nicht reagiert, bleibt das Vibrationspattern als Absicherung.
  }
}

// Zentraler funktionierender Haptics-Pfad für Buttons und SOS.
export function triggerTestHaptic() {
  if (Platform.OS === "web") {
    return;
  }

  if (Platform.OS === "android") {
    void triggerAndroidHapticFeedback(
      Haptics.AndroidHaptics.Long_Press,
      BUTTON_HAPTIC_PATTERN
    );
    return;
  }

  Vibration.vibrate();
  void runHapticFeedback(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  );
}

export function triggerSelectionHaptic() {
  triggerTestHaptic();
}

// Stärkeres Feedback für wichtige Aktionen wie das Starten eines Walks.
export function triggerImpactHaptic(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
) {
  if (Platform.OS === "android") {
    void triggerAndroidHapticFeedback(
      Haptics.AndroidHaptics.Long_Press,
      BUTTON_HAPTIC_PATTERN
    );
    return;
  }

  void runHapticFeedback(() => Haptics.impactAsync(style), 220);
}

// Bestätigungssignal für erfolgreich abgeschlossene Aktionen.
export function triggerSuccessHaptic() {
  if (Platform.OS === "android") {
    void triggerAndroidHapticFeedback(Haptics.AndroidHaptics.Confirm, [
      0, 100, 70, 140,
    ]);
    return;
  }

  void runHapticFeedback(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    [0, 100, 70, 140]
  );
}
