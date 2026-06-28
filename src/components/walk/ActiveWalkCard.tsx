import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../constants/theme";
import { ActiveWalk } from "../../services/walkService";
import AppCard from "../cards/AppCard";
import PrimaryButton from "../buttons/PrimaryButton";

type ActiveWalkCardProps = {
  activeWalk: ActiveWalk;
  remainingTime: string;
  arrivalTime: string;
  isExpiringSoon: boolean;
  onArrivedSafely: () => void;
};

// Kompakte Zusammenfassung des laufenden Walks auf dem Home Screen.
export default function ActiveWalkCard({
  activeWalk,
  remainingTime,
  arrivalTime,
  isExpiringSoon,
  onArrivedSafely,
}: ActiveWalkCardProps) {
  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Active walk</Text>
          <Text style={styles.destination} numberOfLines={2}>
            {activeWalk.destination}
          </Text>
        </View>
        <View
          style={[
            styles.timerBadge,
            isExpiringSoon && styles.timerBadgeExpiring,
          ]}
        >
          <Ionicons name="time-outline" size={18} color={colors.text} />
          <Text style={styles.timerText} numberOfLines={1}>
            {remainingTime}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Expected arrival: {arrivalTime}</Text>
        {activeWalk.routeSuggestion ? (
          <Text style={styles.metaText}>
            {activeWalk.routeSuggestion.distanceKm} km route
          </Text>
        ) : null}
        {isExpiringSoon ? (
          <Text style={styles.expiringText}>
            Please confirm your walk status soon.
          </Text>
        ) : null}
      </View>

      <PrimaryButton
        title="Arrived Safely"
        variant="secondary"
        onPress={onArrivedSafely}
        icon={
          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color={colors.text}
          />
        }
        style={styles.safeButton}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.secondary,
    fontFamily: "nunito-bold",
    fontSize: 13,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  destination: {
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 20,
  },
  timerBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xs,
    height: 42,
    maxWidth: "46%",
    paddingHorizontal: spacing.md,
  },
  timerBadgeExpiring: {
    backgroundColor: colors.danger,
  },
  timerText: {
    color: colors.text,
    flexShrink: 1,
    fontFamily: "nunito-bold",
    fontSize: 16,
  },
  metaRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  metaText: {
    color: colors.mutedText,
    fontFamily: "nunito-regular",
    fontSize: 14,
  },
  expiringText: {
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 14,
  },
  safeButton: {
    marginTop: spacing.md,
  },
});
