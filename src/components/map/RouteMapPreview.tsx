import React from "react";
import { StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import AppCard from "../cards/AppCard";

// Platzhalter fuer die spaetere Karten- und Routenintegration.
export default function RouteMapPreview() {
  return (
    <AppCard style={styles.preview}>
      <Ionicons name="map-outline" size={54} color={colors.secondary} />
      <Text style={styles.title}>Route Map</Text>
      <Text style={styles.subtitle}>
        Your walking route will appear here after map integration.
      </Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  preview: {
    alignItems: "center",
    backgroundColor: "#11151D",
    flex: 1,
    justifyContent: "center",
    marginBottom: spacing.lg,
    minHeight: 260,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 24,
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.mutedText,
    fontFamily: "nunito-regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    maxWidth: 260,
    textAlign: "center",
  },
});
