import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function WalkScreen() {
  const openFullscreenMap = () => {
    router.push("/map-fullscreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SafeWalk</Text>
        <Text style={styles.subtitle}>Get to your destination safely</Text>
      </View>

      <View style={styles.content}>
        {/* Map Preview Card */}
        <TouchableOpacity style={styles.mapCard} onPress={openFullscreenMap} activeOpacity={0.9}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={colors.primary} style={{ opacity: 0.5 }} />
            <Text style={styles.mapPlaceholderText}>Tap to open Map & Route Planner</Text>
          </View>
          
          <View style={styles.mapCardFooter}>
            <View style={styles.footerTextContainer}>
              <Text style={styles.footerTitle}>Where to?</Text>
              <Text style={styles.footerSubtitle}>Enter an address to get a safe route</Text>
            </View>
            <View style={styles.actionIcon}>
              <Ionicons name="search" size={20} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Other Walk Tab content will go here later */}
        <View style={styles.comingSoonCard}>
          <Ionicons name="shield-checkmark" size={32} color={colors.success} style={{ marginBottom: 10 }} />
          <Text style={styles.comingSoonTitle}>Emergency Features</Text>
          <Text style={styles.comingSoonText}>The panic button and contact alerts will be integrated here.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: "rgba(109, 94, 247, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    color: colors.primary,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  mapCardFooter: {
    flexDirection: "row",
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
  },
  footerTextContainer: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  footerSubtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    borderStyle: "dashed",
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: "center",
  }
});
