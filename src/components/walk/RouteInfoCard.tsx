import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";
import { RouteSummary } from "../../services/mapService";

interface RouteInfoCardProps {
  summary: RouteSummary;
  mode: 'walk' | 'bike' | 'car';
  onStartNavigation?: () => void;
}

export default function RouteInfoCard({ summary, mode, onStartNavigation }: RouteInfoCardProps) {
  // Zeit formatieren (Sekunden zu Min/Std)
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return "< 1 min";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours} h ${remainingMins} min`;
  };

  // Distanz formatieren (Meter zu km)
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Icon und Text dynamisch anpassen
  let modeIcon = "walk-outline";
  let buttonText = "Start Walking";
  
  if (mode === 'bike') {
    modeIcon = "bicycle-outline";
    buttonText = "Start Cycling";
  } else if (mode === 'car') {
    modeIcon = "car-outline";
    buttonText = "Start Driving";
  }

  return (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={24} color={colors.primary} />
          <Text style={styles.infoText}>{formatDuration(summary.duration)}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoItem}>
          {/* Dynamisches Icon statt festem walk-outline */}
          <Ionicons name={modeIcon as any} size={24} color={colors.primary} />
          <Text style={styles.infoText}>{formatDistance(summary.distance)}</Text>
        </View>
      </View>
      
      {onStartNavigation && (
        <TouchableOpacity style={styles.startButton} onPress={onStartNavigation}>
          {/* Dynamischer Button-Text */}
          <Text style={styles.startButtonText}>{buttonText}</Text>
          <Ionicons name="navigate" size={18} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  infoItem: {
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
