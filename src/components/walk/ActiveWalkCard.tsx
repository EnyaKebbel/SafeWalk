import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../constants/theme";
import { ActiveWalk, addTimeToActiveWalk } from "../../services/walkService";
import AppCard from "../cards/AppCard";
import PrimaryButton from "../buttons/PrimaryButton";

type ActiveWalkCardProps = {
  activeWalk: ActiveWalk;
  remainingTime: string;
  arrivalTime: string;
  onArrivedSafely: () => void;
  onTimeAdded?: () => void;
};

// Kompakte Zusammenfassung des laufenden Walks auf dem Home Screen.
export default function ActiveWalkCard({
  activeWalk,
  remainingTime,
  arrivalTime,
  onArrivedSafely,
  onTimeAdded,
}: ActiveWalkCardProps) {
  const handleAddTime = async () => {
    await addTimeToActiveWalk(5);
    if (onTimeAdded) {
      onTimeAdded();
    }
  };

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.eyebrow}>Active walk</Text>
          <Text style={styles.destination} numberOfLines={2}>
            {activeWalk.destination}
          </Text>
        </View>
        <View style={styles.timerControls}>
          <TouchableOpacity style={styles.addTimeBtn} onPress={handleAddTime}>
            <Text style={styles.addTimeText}>+5m</Text>
          </TouchableOpacity>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={18} color={colors.text} />
            <Text style={styles.timerText}>{remainingTime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Expected arrival: {arrivalTime}</Text>
        {activeWalk.routeSuggestion ? (
          <Text style={styles.metaText}>
            {activeWalk.routeSuggestion.distanceKm} km route
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
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
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
  timerControls: {
    alignItems: "flex-end",
  },
  addTimeBtn: {
    backgroundColor: colors.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addTimeText: {
    color: colors.primary,
    fontFamily: "nunito-bold",
    fontSize: 12,
  },
  timerBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xs,
    height: 42,
    paddingHorizontal: spacing.md,
  },
  timerText: {
    color: colors.text,
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
  safeButton: {
    marginTop: spacing.md,
  },
});
