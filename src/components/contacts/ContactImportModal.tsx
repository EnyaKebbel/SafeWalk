import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { colors, radius, spacing } from "../../constants/theme";
import PrimaryButton from "../buttons/PrimaryButton";

export type ImportableContact = {
  id: string;
  name: string;
  phoneNumber: string;
};

interface ContactImportModalProps {
  visible: boolean;
  existingPhoneNumbers: string[];
  onClose: () => void;
  onImport: (contacts: ImportableContact[]) => Promise<void>;
}

// Vereinheitlicht Telefonnummern, damit Duplikate trotz Leerzeichen oder Bindestrichen erkannt werden.
function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "");
}

// Wandelt Systemkontakte in importierbare Eintraege fuer die SafeWalk-Kontaktliste um.
function buildImportableContacts(deviceContacts: Contacts.ExistingContact[]) {
  const seenPhoneNumbers = new Set<string>();

  return deviceContacts
    .flatMap((contact) => {
      const name = contact.name?.trim();
      const phoneNumbers = contact.phoneNumbers ?? [];

      if (!name || phoneNumbers.length === 0) {
        return [];
      }

      // Jede Telefonnummer wird einzeln auswaehlbar, weil ein Systemkontakt mehrere Nummern haben kann.
      return phoneNumbers
        .filter((phone) => !!phone.number?.trim())
        .flatMap((phone, index) => {
          const phoneNumber = phone.number!.trim();
          const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

          if (seenPhoneNumbers.has(normalizedPhoneNumber)) {
            return [];
          }

          seenPhoneNumbers.add(normalizedPhoneNumber);

          return {
            id: `${contact.id}-${index}`,
            name,
            phoneNumber,
          };
        });
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function ContactImportModal({
  visible,
  existingPhoneNumbers,
  onClose,
  onImport,
}: ContactImportModalProps) {
  // State fuer geladene Systemkontakte, Auswahl, Suche und Ladezustaende.
  const [contacts, setContacts] = useState<ImportableContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionHint, setPermissionHint] = useState<string | null>(null);

  // Speichert vorhandene Nummern normalisiert, damit bereits importierte Kontakte ausgefiltert werden.
  const existingPhoneSet = useMemo(
    () => new Set(existingPhoneNumbers.map(normalizePhoneNumber)),
    [existingPhoneNumbers]
  );

  // Filtert Kontakte heraus, die bereits in der Notfallkontaktliste vorhanden sind.
  const availableContacts = useMemo(
    () =>
      contacts.filter(
        (contact) => !existingPhoneSet.has(normalizePhoneNumber(contact.phoneNumber))
      ),
    [contacts, existingPhoneSet]
  );

  // Filtert die sichtbare Liste nach Name oder Telefonnummer.
  const filteredContacts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return availableContacts;
    }

    return availableContacts.filter((contact) => {
      const phoneNumber = normalizePhoneNumber(contact.phoneNumber).toLowerCase();
      return (
        contact.name.toLowerCase().includes(searchTerm) ||
        phoneNumber.includes(searchTerm)
      );
    });
  }, [availableContacts, search]);

  const selectedContacts = useMemo(
    () => availableContacts.filter((contact) => selectedIds.includes(contact.id)),
    [availableContacts, selectedIds]
  );

  // Laedt Systemkontakte neu, sobald das Import-Popup geoeffnet wird.
  useEffect(() => {
    if (!visible) {
      return;
    }

    loadDeviceContacts();
  }, [visible]);

  // Aktualisiert die Kontaktliste, wenn der Nutzer aus den Systemeinstellungen zurueckkommt.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (visible && nextState === "active") {
        loadDeviceContacts();
      }
    });

    return () => subscription.remove();
  }, [visible]);

  // Fragt die Kontaktberechtigung ab und liest anschliessend die Systemkontakte.
  const loadDeviceContacts = async () => {
    setLoading(true);
    setError(null);
    setPermissionHint(null);
    setSelectedIds([]);
    setSearch("");

    try {
      const permission = await Contacts.requestPermissionsAsync();

      if (permission.status !== "granted") {
        setContacts([]);
        setError("Contact access was denied. Enable contacts permission to import emergency contacts.");
        setPermissionHint("Open settings and allow contact access for SafeWalk.");
        return;
      }

      if (permission.accessPrivileges === "limited") {
        setPermissionHint("SafeWalk has limited contact access. Open settings and allow full contact access to import from your real contact list.");
      }

      const response = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.PhoneNumbers],
        sort: Platform.OS === "android" ? Contacts.SortTypes.UserDefault : Contacts.SortTypes.FirstName,
      });

      const nextContacts = buildImportableContacts(response.data);
      setContacts(nextContacts);
    } catch {
      setError("Contacts could not be loaded. Please try again.");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Oeffnet die Systemeinstellungen, damit der Nutzer vollen Kontaktzugriff erlauben kann.
  const openAppSettings = async () => {
    await Linking.openSettings();
  };

  // Waehlt einen Kontakt aus oder entfernt ihn wieder aus der Auswahl.
  const toggleContact = (contactId: string) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(contactId)
        ? currentIds.filter((id) => id !== contactId)
        : [...currentIds, contactId]
    );
  };

  // Uebergibt die ausgewaehlten Kontakte an den Contacts-Screen zum Speichern in Firebase.
  const handleImport = async () => {
    if (selectedContacts.length === 0) {
      return;
    }

    setSaving(true);

    try {
      await onImport(selectedContacts);
      onClose();
    } catch {
      setError("The selected contacts could not be imported. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Rendert einen leeren Zustand fuer Fehler, fehlende Berechtigung oder keine Treffer.
  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={32} color={colors.mutedText} />
        <Text style={styles.emptyTitle}>
          {error ? "Import unavailable" : "No contacts found"}
        </Text>
        <Text style={styles.emptyText}>
          {error ??
            permissionHint ??
            "Only contacts with phone numbers that are not already imported are shown."}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Import from Contacts</Text>
              <Text style={styles.modalSubtitle}>
                Select contacts to add to your emergency list
              </Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.mutedText} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name or number"
              placeholderTextColor={colors.mutedText}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {permissionHint && <Text style={styles.permissionHint}>{permissionHint}</Text>}

          {permissionHint ? (
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={openAppSettings}
            >
              <Ionicons name="settings-outline" size={18} color={colors.text} />
              <Text style={styles.pickerButtonText}>Open Settings</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={loadDeviceContacts}
            >
              <Ionicons name="refresh" size={18} color={colors.text} />
              <Text style={styles.pickerButtonText}>Reload Contacts</Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <TouchableOpacity
                    style={[styles.contactRow, isSelected && styles.selectedContactRow]}
                    onPress={() => toggleContact(item.id)}
                  >
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                    </View>

                    <View style={[styles.checkbox, isSelected && styles.selectedCheckbox]}>
                      {isSelected && <Ionicons name="checkmark" size={16} color={colors.text} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View style={styles.footer}>
            <Text style={styles.selectionText}>
              {selectedContacts.length} selected
            </Text>
            <PrimaryButton
              title="Import"
              onPress={handleImport}
              disabled={selectedContacts.length === 0}
              loading={saving}
              icon={<Ionicons name="download-outline" size={18} color={colors.text} />}
              style={styles.importButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: "88%",
    padding: spacing.lg,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  modalSubtitle: {
    color: colors.mutedText,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: radius.sm,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  searchContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
  },
  permissionHint: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  pickerButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  pickerButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  loadingState: {
    alignItems: "center",
    height: 260,
    justifyContent: "center",
  },
  loadingText: {
    color: colors.mutedText,
    marginTop: spacing.sm,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  contactRow: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  selectedContactRow: {
    borderColor: colors.primary,
  },
  contactInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  contactName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  contactPhone: {
    color: colors.mutedText,
    fontSize: 14,
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  selectedCheckbox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    minHeight: 220,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  selectionText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  importButton: {
    minWidth: 130,
  },
});
