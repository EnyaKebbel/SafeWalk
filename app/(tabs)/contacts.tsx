import React, { useCallback, useRef, useState, useEffect } from "react";
import { Alert, View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { colors, spacing } from "../../src/constants/theme";
import {
  listenToContacts,
  addTrustedContact,
  addTrustedContacts,
  updateTrustedContact,
  updateContactsOrder,
  deleteTrustedContact,
  getCachedTrustedContacts,
  fetchLatestTrustedContacts,
  TrustedContact,
} from "../../src/services/contactService";

import ContactCard from "../../src/components/contacts/ContactCard";
import ContactModal from "../../src/components/contacts/ContactModal";
import ContactImportModal, { ImportableContact } from "../../src/components/contacts/ContactImportModal";
import DeleteConfirmModal from "../../src/components/modals/DeleteConfirmModal";

export default function ContactsScreen() {
  // Speichert die Liste aller Notfallkontakte aus Firebase
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [isShowingCachedContacts, setIsShowingCachedContacts] = useState(false);
  const lastLiveSnapshotAt = useRef(0);
  
  // State-Variablen für das Popup zum Hinzufügen/Bearbeiten
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [importModalVisible, setImportModalVisible] = useState(false);

  // State für das eigene Lösch-Bestätigungs-Popup
  const [contactToDelete, setContactToDelete] = useState<{id: string, name: string} | null>(null);

  // Holt zuerst den lokalen Cache und aktualisiert danach live aus Firebase.
  useEffect(() => {
    let cacheNoticeTimeout: ReturnType<typeof setTimeout> | null = null;

    // Dadurch ist die Kontaktliste sofort nutzbar, waehrend Firebase noch verbindet.
    getCachedTrustedContacts().then((cachedContacts) => {
      if (cachedContacts.length > 0) {
        setContacts(cachedContacts);
        // Expo/Firebase meldet im Flugmodus nicht immer sofort einen Fehler.
        // Wenn kein Live-Snapshot kommt, markieren wir den sichtbaren Stand als Cache.
        cacheNoticeTimeout = setTimeout(() => {
          setIsShowingCachedContacts(true);
        }, 2000);
      }
    });

    const unsubscribe = listenToContacts((fetchedContacts, options) => {
      if (cacheNoticeTimeout) {
        clearTimeout(cacheNoticeTimeout);
      }

      setContacts(fetchedContacts);
      // Firestore markiert Snapshots aus dem lokalen Cache, z.B. im Flugmodus.
      setIsShowingCachedContacts(options?.isFromCache ?? false);
      if (!options?.isFromCache) {
        lastLiveSnapshotAt.current = Date.now();
      }
    }, async () => {
      // Wenn der Live-Listener scheitert, bleibt der letzte gespeicherte Stand sichtbar.
      const cachedContacts = await getCachedTrustedContacts();
      if (cachedContacts.length > 0) {
        setContacts(cachedContacts);
        setIsShowingCachedContacts(true);
      }
    });

    return () => {
      if (cacheNoticeTimeout) {
        clearTimeout(cacheNoticeTimeout);
      }
      unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      // Tabs werden nicht immer neu gemountet. Beim Fokus pruefen wir deshalb erneut,
      // ob nur alte Cache-Daten sichtbar sind und kein aktueller Live-Snapshot kam.
      const timeoutId = setTimeout(async () => {
        const cachedContacts = await getCachedTrustedContacts();
        const liveSnapshotIsStale = Date.now() - lastLiveSnapshotAt.current > 3000;

        if (isActive && cachedContacts.length > 0 && liveSnapshotIsStale) {
          setIsShowingCachedContacts(true);
        }
      }, 2000);

      return () => {
        isActive = false;
        clearTimeout(timeoutId);
      };
    }, [])
  );

  // Öffnet das Popup für einen neuen oder bestehenden Kontakt
  useEffect(() => {
    if (!isShowingCachedContacts) {
      return;
    }

    const tryRefreshFromFirebase = async () => {
      try {
        // Sobald Firebase wieder erreichbar ist, ersetzen wir den Cache durch Live-Daten.
        const latestContacts = await fetchLatestTrustedContacts();
        setContacts(latestContacts);
        setIsShowingCachedContacts(false);
        lastLiveSnapshotAt.current = Date.now();
      } catch {
        // Offline bleiben wir ruhig beim lokalen Cache und versuchen es spaeter erneut.
      }
    };

    const intervalId = setInterval(tryRefreshFromFirebase, 5000);
    tryRefreshFromFirebase();

    return () => clearInterval(intervalId);
  }, [isShowingCachedContacts]);

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

  // Importiert mehrere Systemkontakte und hängt sie ans Ende der Prioritäten.
  const handleImportContacts = async (contactsToImport: ImportableContact[]) => {
    try {
      await addTrustedContacts(
        contactsToImport.map((contact) => ({
          name: contact.name,
          contactNumber: contact.phoneNumber,
        })),
        contacts.length
      );
    } catch {
      Alert.alert("Import failed", "The selected contacts could not be imported. Please try again.");
      throw new Error("Contact import failed");
    }
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

      {isShowingCachedContacts && (
        // Sichtbarer Nachweis fuer den Offline-/Caching-Modus aus der Aufgabenstellung.
        <View style={styles.cacheNotice}>
          <Ionicons name="cloud-offline-outline" size={18} color={colors.secondary} />
          <Text style={styles.cacheNoticeText}>
            Offline mode: showing saved contacts.
          </Text>
        </View>
      )}

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

      {/* Floating Action Button (FAB) zum Importieren bestehender Systemkontakte */}
      <TouchableOpacity style={styles.importFab} onPress={() => setImportModalVisible(true)}>
        <Ionicons name="people-outline" size={20} color="#FFF" />
        <Text style={styles.importFabText}>Import from Contacts</Text>
      </TouchableOpacity>

      {/* Floating Action Button (FAB) zum Hinzufügen neuer Kontakte */}
      <TouchableOpacity style={styles.addFab} onPress={() => openModal()}>
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

      {/* Importiert bestehende Systemkontakte in die SafeWalk-Notfallkontakte. */}
      <ContactImportModal
        visible={importModalVisible}
        existingPhoneNumbers={contacts.map((contact) => contact.contactNumber)}
        onClose={() => setImportModalVisible(false)}
        onImport={handleImportContacts}
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
  cacheNotice: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
  },
  cacheNoticeText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Extra Abstand unten
  },
  addFab: {
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
  importFab: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: 96,
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  importFabText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
});
