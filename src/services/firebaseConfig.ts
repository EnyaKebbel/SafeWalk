import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBLj9Ii0_PKtr8p8oV_vyCIMucwrebyBxU",
    authDomain: "safewalk-d4287.firebaseapp.com",
    projectId: "safewalk-d4287",
    storageBucket: "safewalk-d4287.firebasestorage.app",
    messagingSenderId: "310644118518",
    appId: "1:310644118518:web:5d853db874480c3309edd7",
    measurementId: "G-EPJ07ES2ZF",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);