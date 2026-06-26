import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";
import { TrustedContact } from "../../services/contactService";

interface ContactCardProps {
  contact: TrustedContact;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (contact: TrustedContact) => void;
  onDelete: (id: string, name: string) => void;
}

export default function ContactCard({
  contact,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: ContactCardProps) {
  return (
    <View style={styles.contactCard}>
      {/* Linker Bereich: Pfeile zur Änderung der Priorität */}
      <View style={styles.priorityControls}>
        <TouchableOpacity 
          onPress={() => onMoveUp(index)} 
          disabled={isFirst}
          style={[styles.arrowButton, isFirst && styles.disabledArrow]}
        >
          <Ionicons name="chevron-up" size={20} color={isFirst ? colors.border : colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>{index + 1}</Text>
        </View>

        <TouchableOpacity 
          onPress={() => onMoveDown(index)} 
          disabled={isLast}
          style={[styles.arrowButton, isLast && styles.disabledArrow]}
        >
          <Ionicons name="chevron-down" size={20} color={isLast ? colors.border : colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Mittlerer Bereich: Kontaktinformationen (Name und Nummer) */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactPhone}>{contact.contactNumber}</Text>
      </View>

      {/* Rechter Bereich: Aktions-Buttons (Bearbeiten, Löschen) */}
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => onEdit(contact)} style={styles.actionIcon}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(contact.id!, contact.name)} style={styles.actionIcon}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityControls: {
    alignItems: "center",
    marginRight: spacing.md,
    width: 36,
  },
  arrowButton: {
    padding: 4,
    backgroundColor: 'rgba(109, 94, 247, 0.1)', 
    borderRadius: radius.sm,
    marginVertical: 2,
  },
  disabledArrow: {
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  priorityBadge: {
    backgroundColor: colors.border,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  priorityText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.mutedText,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionIcon: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radius.sm,
  },
});
