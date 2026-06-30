import {
    FirestoreError,
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    updateDoc,
    writeBatch,
    getDocs,
    getDocsFromServer,
    limit
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";

// Kontakt-Service: kümmert sich nur um Daten, nicht um UI.
// Firebase ist die Hauptquelle, AsyncStorage ist unser Offline-Cache.

const CONTACTS_CACHE_KEY = "@safewalk_cached_contacts";

export type TrustedContact = {
    id?: string;
    name: string;
    contactNumber: string;
    order?: number;
};

// Neue Kontakte haben noch keine Firebase-ID, weil Firebase sie erst beim Speichern vergibt.
export type NewTrustedContact = {
    name: string;
    contactNumber: string;
};

async function cacheTrustedContacts(contacts: TrustedContact[]) {
    // Letzter erfolgreicher Firebase-Stand bleibt für den Offline-Fall lokal verfügbar.
    await AsyncStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(contacts));
}

// Lädt Kontakte aus dem lokalen Speicher, damit die App auch offline etwas anzeigen kann.
export async function getCachedTrustedContacts() {
    const value = await AsyncStorage.getItem(CONTACTS_CACHE_KEY);

    if (!value) {
        return [];
    }

    try {
        return JSON.parse(value) as TrustedContact[];
    } catch {
        // Falls alte Cache-Daten vorhanden sind, startet die App mit einer leeren Liste.
        return [];
    }
}

export async function addTrustedContact(
    name: string,
    contactNumber: string,
    order: number
) {
    // Einzelnen Kontakt in der Firestore-Collection "contacts" anlegen.
    await addDoc(collection(db, "contacts"), {
        name,
        contactNumber,
        order,
        createdAt: serverTimestamp(),
    });
}

// Speichert mehrere importierte Kontakte in einem gemeinsamen Firebase-Batch.
export async function addTrustedContacts(
    contacts: NewTrustedContact[],
    startOrder: number
) {
    const batch = writeBatch(db);

    contacts.forEach((contact, index) => {
        const contactRef = doc(collection(db, "contacts"));
        batch.set(contactRef, {
            name: contact.name,
            contactNumber: contact.contactNumber,
            order: startOrder + index,
            createdAt: serverTimestamp(),
        });
    });

    await batch.commit();
}

export function listenToContacts(
    callback: (
        contacts: TrustedContact[],
        options?: { isFromCache: boolean }
    ) => void,
    onError?: (error: FirestoreError) => void
) {
    // Live-Listener: der Contacts-Screen bekommt Änderungen automatisch mit.
    const q = query(collection(db, "contacts"), orderBy("order", "asc"));
    return onSnapshot(
        q,
        { includeMetadataChanges: true },
        async (snapshot) => {
            const contacts = snapshot.docs.map((document) => ({
                id: document.id,
                ...(document.data() as Omit<TrustedContact, "id">),
            }));

            await cacheTrustedContacts(contacts);
            callback(contacts, { isFromCache: snapshot.metadata.fromCache });
        },
        onError
    );
}

export async function fetchLatestTrustedContacts() {
    const q = query(collection(db, "contacts"), orderBy("order", "asc"));
    // Reconnect-Prüfung: hier bewusst nur Server, nicht Firestore-Cache.
    const snapshot = await getDocsFromServer(q);
    const contacts = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<TrustedContact, "id">),
    }));

    await cacheTrustedContacts(contacts);
    return contacts;
}

export async function getTopPriorityContact(): Promise<TrustedContact | null> {
    // Der erste Kontakt in der Sortierung ist unser wichtigster Notfallkontakt.
    const q = query(collection(db, "contacts"), orderBy("order", "asc"), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...(docSnap.data() as Omit<TrustedContact, "id">) };
}

export async function updateTrustedContact(
    id: string,
    name: string,
    contactNumber: string
) {
    // Ändert nur Name und Telefonnummer, die Priorität bleibt gleich.
    const contactRef = doc(db, "contacts", id);
    await updateDoc(contactRef, {
        name,
        contactNumber,
    });
}

export async function updateContactsOrder(contacts: TrustedContact[]) {
    // Speichert die sichtbare Reihenfolge als order-Wert in Firebase.
    const batch = writeBatch(db);
    
    contacts.forEach((contact, index) => {
        if (contact.id) {
            const contactRef = doc(db, "contacts", contact.id);
            batch.update(contactRef, { order: index });
        }
    });
    
    await batch.commit();
}

export async function deleteTrustedContact(id: string) {
    // Entfernt den Kontakt endgültig aus Firebase.
    await deleteDoc(doc(db, "contacts", id));
}
