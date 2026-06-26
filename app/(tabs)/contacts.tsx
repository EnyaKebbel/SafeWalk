import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

import {
  addTrustedContact,
  listenToContacts,
  deleteTrustedContact,
  updateTrustedContact,
  updateContactsOrder,
  TrustedContact,
} from "../../src/services/contactService";

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => openAddModal()} style={{ paddingRight: 16 }}>
          <Ionicons name="add" size={28} color="#111827" />
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = listenToContacts((fetchedContacts) => {
      setContacts(fetchedContacts);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingContact(null);
    setName("");
    setPhone("");
    setModalVisible(true);
  };

  const openEditModal = (contact: TrustedContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.contactNumber);
    setModalVisible(true);
  };

  const handleSaveContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Fehlende Daten", "Bitte gib einen Namen und eine Telefonnummer ein.");
      return;
    }

    try {
      if (editingContact && editingContact.id) {
        await updateTrustedContact(editingContact.id, name.trim(), phone.trim());
      } else {
        const nextOrder = contacts.length;
        await addTrustedContact(name.trim(), phone.trim(), nextOrder);
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving contact: ", error);
      Alert.alert("Fehler", "Der Kontakt konnte nicht gespeichert werden.");
    }
  };

  const handleRemoveContact = async (id: string) => {
    try {
      await deleteTrustedContact(id);
    } catch (error) {
      console.error("Error deleting contact: ", error);
      Alert.alert("Fehler", "Der Kontakt konnte nicht gelöscht werden.");
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return; // Already at the top
    const newContacts = [...contacts];
    // Swap
    const temp = newContacts[index];
    newContacts[index] = newContacts[index - 1];
    newContacts[index - 1] = temp;
    
    // Update local state immediately for fast UI
    setContacts(newContacts);
    // Sync with Firebase
    try {
      await updateContactsOrder(newContacts);
    } catch (error) {
      console.error("Error updating order: ", error);
      Alert.alert("Fehler", "Die neue Reihenfolge konnte nicht gespeichert werden.");
    }
  };

  const moveDown = async (index: number) => {
    if (index === contacts.length - 1) return; // Already at the bottom
    const newContacts = [...contacts];
    // Swap
    const temp = newContacts[index];
    newContacts[index] = newContacts[index + 1];
    newContacts[index + 1] = temp;
    
    // Update local state immediately for fast UI
    setContacts(newContacts);
    // Sync with Firebase
    try {
      await updateContactsOrder(newContacts);
    } catch (error) {
      console.error("Error updating order: ", error);
      Alert.alert("Fehler", "Die neue Reihenfolge konnte nicht gespeichert werden.");
    }
  };

  const renderItem = ({ item, index }: { item: TrustedContact; index: number }) => {
    return (
      <View style={styles.contactCard}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {item.name} {index === 0 ? " (Prio 1)" : ""}
          </Text>
          <Text style={styles.contactPhone}>{item.contactNumber}</Text>
        </View>
        
        <View style={styles.actions}>
          {index > 0 && (
            <Pressable onPress={() => moveUp(index)} style={styles.actionButton}>
              <Ionicons name="arrow-up-outline" size={20} color="#10B981" />
            </Pressable>
          )}
          {index < contacts.length - 1 && (
            <Pressable onPress={() => moveDown(index)} style={styles.actionButton}>
              <Ionicons name="arrow-down-outline" size={20} color="#F59E0B" />
            </Pressable>
          )}
          <Pressable onPress={() => openEditModal(item)} style={styles.actionButton}>
            <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
          </Pressable>
          <Pressable onPress={() => item.id && handleRemoveContact(item.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Use the up and down arrows to set priority. The first contact is your primary emergency contact.
      </Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact ? "Edit Contact" : "Add Contact"}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Pressable style={styles.primaryButton} onPress={handleSaveContact}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  input: {
    backgroundColor: "#F7F7F8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#111827",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
