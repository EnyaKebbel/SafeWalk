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
    limit
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig";

const CONTACTS_CACHE_KEY = "@safewalk_cached_contacts";

export type TrustedContact = {
    id?: string;
    name: string;
    contactNumber: string;
    order?: number;
};

// Typ fuer neue Kontakte, die noch keine Firebase-ID haben.
export type NewTrustedContact = {
    name: string;
    contactNumber: string;
};

async function cacheTrustedContacts(contacts: TrustedContact[]) {
    // Letzter erfolgreicher Firebase-Stand bleibt für den Offline-Fall lokal verfügbar.
    await AsyncStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(contacts));
}

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
    callback: (contacts: TrustedContact[]) => void,
    onError?: (error: FirestoreError) => void
) {
    const q = query(collection(db, "contacts"), orderBy("order", "asc"));
    return onSnapshot(q, async (snapshot) => {
        const contacts = snapshot.docs.map((document) => ({
            id: document.id,
            ...(document.data() as Omit<TrustedContact, "id">),
        }));

        await cacheTrustedContacts(contacts);
        callback(contacts);
    }, onError);
}

export async function getTopPriorityContact(): Promise<TrustedContact | null> {
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
    const contactRef = doc(db, "contacts", id);
    await updateDoc(contactRef, {
        name,
        contactNumber,
    });
}

export async function updateContactsOrder(contacts: TrustedContact[]) {
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
    await deleteDoc(doc(db, "contacts", id));
}
