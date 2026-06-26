import * as Haptics from "expo-haptics";

async function runHapticFeedback(feedback: () => Promise<void>) {
  try {
    await feedback();
  } catch {
    // Haptisches Feedback ist auf Simulatoren oder ohne Vibrationsmotor nicht immer verfuegbar.
  }
}

export function triggerSelectionHaptic() {
  void runHapticFeedback(() => Haptics.selectionAsync());
}

export function triggerImpactHaptic(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
) {
  void runHapticFeedback(() => Haptics.impactAsync(style));
}

export function triggerWarningHaptic() {
  void runHapticFeedback(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  );
}

export function triggerSuccessHaptic() {
  void runHapticFeedback(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  );
}
