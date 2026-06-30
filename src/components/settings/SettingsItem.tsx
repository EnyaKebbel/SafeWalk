import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  type?: "link" | "switch";
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
}

// Komponente für einzelne Einträge in Einstellungen
export default function SettingsItem({
  icon,
  title,
  description,
  type = "link",
  value,
  onValueChange,
  onPress,
}: SettingsItemProps) {
  const isSwitch = type === "switch";

  const content = (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <View style={styles.actionContainer}>
        {isSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={value ? "#FFF" : "#f4f3f4"}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
        )}
      </View>
    </View>
  );

  if (isSwitch) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(109, 94, 247, 0.1)',
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 2,
  },
  actionContainer: {
    marginLeft: spacing.sm,
  },
});
