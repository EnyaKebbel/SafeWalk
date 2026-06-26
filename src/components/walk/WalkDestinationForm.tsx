import React, { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as yup from "yup";
import { router } from "expo-router";
import { colors, radius, spacing } from "../../constants/theme";
import PrimaryButton from "../buttons/PrimaryButton";
import { TransportMode } from "../../services/routeService";

export type WalkFormValues = {
  destination: string;
  minutes: string;
};

type WalkDestinationFormProps = {
  children?: ReactNode;
  suggestionError: string;
  isEstimating: boolean;
  onDestinationChange: () => void;
  onEstimateRoute: (
    destination: string,
    mode: TransportMode,
    applySuggestion: (values: WalkFormValues) => void
  ) => void;
  onSubmit: (values: WalkFormValues) => void;
};

const walkDetailsSchema = yup.object({
  destination: yup
    .string()
    .trim()
    .required("Destination is required.")
    .min(3, "Enter at least 3 characters."),
  minutes: yup
    .string()
    .required("Expected time is required.")
    .test(
      "is-valid-arrival-time",
      "Enter a time between 1 and 240 minutes.",
      (value) => {
        const parsedValue = Number((value ?? "").replace(",", "."));
        return (
          Number.isFinite(parsedValue) &&
          parsedValue >= 1 &&
          parsedValue <= 240
        );
      }
    ),
});

// Formular fuer Ziel und erwartete Gehzeit auf dem Walk Details Screen.
export default function WalkDestinationForm({
  children,
  suggestionError,
  isEstimating,
  onDestinationChange,
  onEstimateRoute,
  onSubmit,
}: WalkDestinationFormProps) {
  const [mode, setMode] = useState<TransportMode>('walk');

  return (
    <Formik
      initialValues={{ destination: "", minutes: "" }}
      validationSchema={walkDetailsSchema}
      onSubmit={onSubmit}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldError,
        setFieldTouched,
        setFieldValue,
        touched,
        values,
      }) => (
        <View>
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Destination</Text>
              <TouchableOpacity onPress={() => router.push('/map-fullscreen')} style={styles.mapButton}>
                <Ionicons name="map" size={16} color={colors.primary} />
                <Text style={styles.mapButtonText}>Interactive Map</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.inputRow,
                touched.destination && errors.destination && styles.inputError,
              ]}
            >
              <Ionicons
                name="location-outline"
                size={22}
                color={colors.secondary}
              />
              <TextInput
                style={styles.input}
                value={values.destination}
                onBlur={handleBlur("destination")}
                onChangeText={(value) => {
                  handleChange("destination")(value);
                  onDestinationChange();
                }}
                placeholder="Where are you going?"
                placeholderTextColor={colors.mutedText}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
            {touched.destination && errors.destination ? (
              <Text style={styles.errorText}>{errors.destination}</Text>
            ) : null}

            {/* Transport Mode Selector */}
            <View style={styles.modeSelector}>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'walk' && styles.modeButtonActive]} 
                onPress={() => setMode('walk')}
              >
                <Ionicons name="walk" size={20} color={mode === 'walk' ? '#FFF' : colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'bike' && styles.modeButtonActive]} 
                onPress={() => setMode('bike')}
              >
                <Ionicons name="bicycle" size={20} color={mode === 'bike' ? '#FFF' : colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'car' && styles.modeButtonActive]} 
                onPress={() => setMode('car')}
              >
                <Ionicons name="car" size={20} color={mode === 'car' ? '#FFF' : colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Expected time</Text>
              <Pressable
                style={styles.estimateButton}
                onPress={() => {
                  if (!values.destination.trim()) {
                    setFieldTouched("destination", true);
                    setFieldError(
                      "destination",
                      "Enter a destination before estimating the route."
                    );
                    return;
                  }

                  onEstimateRoute(values.destination, mode, (suggestedValues) => {
                    setFieldValue("destination", suggestedValues.destination);
                    setFieldValue("minutes", suggestedValues.minutes);
                  });
                }}
                disabled={isEstimating}
              >
                {isEstimating ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Ionicons
                    name="sparkles-outline"
                    size={16}
                    color={colors.text}
                  />
                )}
                <Text style={styles.estimateButtonText}>Estimate</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.inputRow,
                touched.minutes && errors.minutes && styles.inputError,
              ]}
            >
              <Ionicons name="time-outline" size={22} color={colors.secondary} />
              <TextInput
                style={styles.input}
                value={values.minutes}
                onBlur={handleBlur("minutes")}
                onChangeText={handleChange("minutes")}
                placeholder="Minutes"
                placeholderTextColor={colors.mutedText}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <Text style={styles.unit}>min</Text>
            </View>
            {touched.minutes && errors.minutes ? (
              <Text style={styles.errorText}>{errors.minutes}</Text>
            ) : null}

            <Text style={styles.helperText}>
              {suggestionError ||
                "You can always override the route suggestion with your own time."}
            </Text>
          </View>

          {children}

          <PrimaryButton
            title="Start Walk"
            onPress={() => handleSubmit()}
            icon={<Ionicons name="play" size={20} color={colors.text} />}
            style={styles.startButton}
          />
        </View>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  formSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 16,
    marginBottom: 0,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modeSelector: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderRadius: radius.full,
    marginTop: spacing.md,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: "nunito-regular",
    fontSize: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  unit: {
    color: colors.mutedText,
    fontFamily: "nunito-bold",
    fontSize: 14,
  },
  estimateButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  estimateButtonText: {
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 13,
  },
  helperText: {
    color: colors.mutedText,
    fontFamily: "nunito-regular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontFamily: "nunito-bold",
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  startButton: {
    marginTop: spacing.xl,
  },
});
