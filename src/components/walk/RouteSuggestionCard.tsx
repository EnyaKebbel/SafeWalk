import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import { RouteSuggestion } from "../../services/routeService";
import AppCard from "../cards/AppCard";

type RouteSuggestionCardProps = {
  suggestion: RouteSuggestion;
};

// Zeigt den API-Vorschlag, laesst die manuelle Zeit aber bewusst unangetastet.
export default function RouteSuggestionCard({
  suggestion,
}: RouteSuggestionCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.content}>
        <Ionicons name="walk-outline" size={18} color={colors.secondary} />
        <Text style={styles.text}>
          Suggested by route: {suggestion.durationMinutes} min for{" "}
          {suggestion.distanceKm} km
        </Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#102526",
    borderColor: colors.secondary,
    marginTop: spacing.md,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  text: {
    color: colors.text,
    flex: 1,
    fontFamily: "nunito-bold",
    fontSize: 14,
    lineHeight: 20,
  },
});
