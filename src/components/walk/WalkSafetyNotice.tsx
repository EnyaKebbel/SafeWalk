import React from "react";
import { StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import AppCard from "../cards/AppCard";

// Hinweis auf die spätere Emergency-Contact-Logik.
export default function WalkSafetyNotice() {
  return (
    <AppCard style={styles.notice}>
      <Ionicons
        name="shield-checkmark-outline"
        size={24}
        color={colors.primary}
      />
      <Text style={styles.text}>
        If this time runs out before you mark yourself safe, SafeWalk can later
        notify your emergency contact.
      </Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  notice: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
  },
  text: {
    color: colors.mutedText,
    flex: 1,
    fontFamily: "nunito-regular",
    fontSize: 14,
    lineHeight: 20,
  },
});
