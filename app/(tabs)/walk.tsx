import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { AppText } from '../../src/components/layout/AppText';

export default function WalkScreen() {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText style={styles.title}>Plan a Walk</AppText>
        <AppText style={styles.subtitle}>Enter a destination and get a secure route.</AppText>
      </View>

      <TouchableOpacity 
        style={styles.mapPreviewCard}
        activeOpacity={0.8}
        onPress={() => router.push('/map-fullscreen')}
      >
        <View style={styles.placeholderMap}>
          <Ionicons name="map" size={60} color={colors.primary} />
          <AppText style={styles.previewText}>Tap to open interactive Map</AppText>
        </View>
        <View style={styles.cardFooter}>
          <Ionicons name="search" size={20} color={colors.mutedText} />
          <AppText style={styles.footerText}>Where are you heading?</AppText>
        </View>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold', // Wird ggf. von AppText überschrieben, falls fontFamily streng ist, aber es schadet nicht
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    marginTop: spacing.xs,
  },
  mapPreviewCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  placeholderMap: {
    height: 200,
    backgroundColor: '#E8F0FE', // Light blueish map tint
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    marginTop: 10,
    color: colors.primary,
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
    fontSize: 16,
  }
});
