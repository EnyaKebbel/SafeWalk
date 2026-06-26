import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { colors, spacing, radius } from "../src/constants/theme";

export default function LegalScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Legal",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }} 
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.text}>
            This is a student project in the context of the course Mobile Web Apps, 
            of the degree program Communication, Knowledge, Media at the UAP.
          </Text>
          <View style={styles.divider} />
          <Text style={styles.authors}>
            App developed by{"\n"}Enya Kebbel & Vanessa Achleitner :)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  authors: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
  },
});
