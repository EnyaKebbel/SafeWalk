import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { triggerTestHaptic } from "../../services/hapticsService";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  style?: StyleProp<ViewStyle>;
};

// Wiederverwendbarer Button fuer die wichtigsten Aktionen der App.
export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = "primary",
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  // Gibt vor der eigentlichen Button-Aktion direkt haptisches Feedback.
  const handlePress = () => {
    triggerTestHaptic();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "danger" && styles.dangerButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator size="small" color={colors.text} /> : icon}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  disabledButton: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 16,
  },
});
