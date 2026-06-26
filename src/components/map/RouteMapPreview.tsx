import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, radius, spacing } from "../../constants/theme";

export default function RouteMapPreview() {
  return (
    <TouchableOpacity 
      style={styles.mapPreviewCard}
      activeOpacity={0.8}
      onPress={() => router.push('/map-fullscreen')}
    >
      <View style={styles.placeholderMap}>
        <Ionicons name="map" size={60} color={colors.primary} />
        <Text style={styles.previewText}>Tap to open interactive Map</Text>
      </View>
      <View style={styles.cardFooter}>
        <Ionicons name="search" size={20} color={colors.mutedText} />
        <Text style={styles.footerText}>Where are you heading?</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapPreviewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: spacing.lg,
    flex: 1, // Nimmt den verfügbaren Platz wie der alte Platzhalter
  },
  placeholderMap: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#E8F0FE', // Light blueish map tint
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  footerText: {
    marginLeft: spacing.sm,
    color: colors.mutedText,
    fontFamily: "nunito-regular",
    fontSize: 16,
  }
});
