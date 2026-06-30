import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../constants/theme";
import { listenToContacts, TrustedContact } from "../../services/contactService";

import PrimaryButton from "../buttons/PrimaryButton";

type NotifyContactModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectContacts: (contacts: TrustedContact[]) => void;
  onSkip: () => void;
};

// Popup nach "Arrived Safely" - Kontakte auswählen & per SMS informieren
export default function NotifyContactModal({ visible, onClose, onSelectContacts, onSkip }: NotifyContactModalProps) {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      const unsubscribe = listenToContacts((fetchedContacts) => {
        setContacts(fetchedContacts);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Zurücksetzen, wenn das Modal geschlossen wird.
      setSelectedIds(new Set());
    }
  }, [visible]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleNotifySelected = () => {
    const selectedContacts = contacts.filter(c => c.id && selectedIds.has(c.id));
    onSelectContacts(selectedContacts);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={styles.title}>You Arrived!</Text>
            <Text style={styles.subtitle}>Who do you want to notify?</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : contacts.length === 0 ? (
            <Text style={styles.noContactsText}>You haven't set up any emergency contacts yet.</Text>
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id!}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = selectedIds.has(item.id!);
                return (
                  <TouchableOpacity 
                    style={[styles.contactItem, isSelected && styles.contactItemActive]}
                    onPress={() => toggleSelection(item.id!)}
                  >
                    <View style={styles.contactIcon}>
                      <Ionicons name="person" size={20} color={isSelected ? colors.primary : colors.text} />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactNumber}>{item.contactNumber}</Text>
                    </View>
                    <Ionicons 
                      name={isSelected ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={isSelected ? colors.primary : colors.mutedText} 
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {contacts.length > 0 && (
            <PrimaryButton 
              title={`Notify Selected (${selectedIds.size})`} 
              onPress={handleNotifySelected} 
              disabled={selectedIds.size === 0}
            />
          )}

          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Skip, don't notify anyone</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
  },
  loader: {
    marginVertical: spacing.xl,
  },
  noContactsText: {
    color: colors.mutedText,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  list: {
    maxHeight: 300,
    marginBottom: spacing.md,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactItemActive: {
    // Macht ausgewählte Kontakte sichtbar, ohne das Layout zu verändern.
    borderColor: colors.primary,
    backgroundColor: colors.cardLight,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  contactNumber: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 2,
  },
  skipButton: {
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  skipText: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: "600",
  }
});
