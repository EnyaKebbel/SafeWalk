import {
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
import { db } from "./firebaseConfig";

export type TrustedContact = {
    id?: string;
    name: string;
    contactNumber: string;
    order?: number;
};

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

export function listenToContacts(
    callback: (contacts: TrustedContact[]) => void
) {
    const q = query(collection(db, "contacts"), orderBy("order", "asc"));
    return onSnapshot(q, (snapshot) => {
        const contacts = snapshot.docs.map((document) => ({
            id: document.id,
            ...(document.data() as Omit<TrustedContact, "id">),
        }));

        callback(contacts);
    });
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