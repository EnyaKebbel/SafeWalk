import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { triggerSelectionHaptic } from "../../services/hapticsService";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
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
  const handlePress = () => {
    triggerSelectionHaptic();
    onPress();
  };

  return (
    <Pressable
      style={[
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {loading ? <ActivityIndicator size="small" color={colors.text} /> : icon}
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
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
  disabledButton: {
    opacity: 0.45,
  },
  buttonText: {
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 16,
  },
});
