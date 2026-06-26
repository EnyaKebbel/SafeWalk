import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../src/constants/theme";
import {
  listenToContacts,
  addTrustedContact,
  updateTrustedContact,
  updateContactsOrder,
  deleteTrustedContact,
  TrustedContact,
} from "../../src/services/contactService";

import ContactCard from "../../src/components/contacts/ContactCard";
import ContactModal from "../../src/components/contacts/ContactModal";
import DeleteConfirmModal from "../../src/components/modals/DeleteConfirmModal";

export default function ContactsScreen() {
  // Speichert die Liste aller Notfallkontakte aus Firebase
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  
  // State-Variablen für das Popup zum Hinzufügen/Bearbeiten
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // State für das eigene Lösch-Bestätigungs-Popup
  const [contactToDelete, setContactToDelete] = useState<{id: string, name: string} | null>(null);

  // Holt die Kontakte in Echtzeit aus Firebase
  useEffect(() => {
    const unsubscribe = listenToContacts((fetchedContacts) => {
      setContacts(fetchedContacts);
    });
    return () => unsubscribe();
  }, []);

  // Öffnet das Popup für einen neuen oder bestehenden Kontakt
  const openModal = (contact?: TrustedContact) => {
    if (contact) {
      setEditingId(contact.id!);
      setName(contact.name);
      setPhone(contact.contactNumber);
    } else {
      setEditingId(null);
      setName("");
      setPhone("");
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setName("");
    setPhone("");
  };

  // Speichert den Kontakt
  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) return;

    if (editingId) {
      await updateTrustedContact(editingId, name, phone);
    } else {
      await addTrustedContact(name, phone, contacts.length);
    }
    closeModal();
  };

  const confirmDelete = (id: string, contactName: string) => {
    setContactToDelete({ id, name: contactName });
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    await deleteTrustedContact(contactToDelete.id);
    setContactToDelete(null);
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newContacts = [...contacts];
    const temp = newContacts[index];
    newContacts[index] = newContacts[index - 1];
    newContacts[index - 1] = temp;
    
    setContacts(newContacts);
    await updateContactsOrder(newContacts);
  };

  const moveDown = async (index: number) => {
    if (index === contacts.length - 1) return;
    const newContacts = [...contacts];
    const temp = newContacts[index];
    newContacts[index] = newContacts[index + 1];
    newContacts[index + 1] = temp;
    
    setContacts(newContacts);
    await updateContactsOrder(newContacts);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>Prioritize who gets called first</Text>
      </View>

      {/* Rendert die scrollbare Kontaktliste */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id!}
        renderItem={({ item, index }) => (
          <ContactCard
            contact={item}
            index={index}
            isFirst={index === 0}
            isLast={index === contacts.length - 1}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onEdit={openModal}
            onDelete={confirmDelete}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button (FAB) zum Hinzufügen neuer Kontakte */}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Ausgelagertes Popup-Fenster für Kontakte */}
      <ContactModal
        visible={modalVisible}
        isEditing={!!editingId}
        name={name}
        phone={phone}
        onNameChange={setName}
        onPhoneChange={setPhone}
        onClose={closeModal}
        onSave={handleSave}
      />

      {/* Ausgelagertes Popup zur Lösch-Bestätigung */}
      <DeleteConfirmModal
        visible={contactToDelete !== null}
        contactName={contactToDelete?.name}
        onClose={() => setContactToDelete(null)}
        onConfirm={handleDelete}
      />
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
    paddingBottom: spacing.lg,
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Extra Abstand unten
  },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
