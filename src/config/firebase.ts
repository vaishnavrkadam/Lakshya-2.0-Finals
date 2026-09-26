import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import {
    getFirestore,
    initializeFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    type DocumentData
} from 'firebase/firestore';
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';

// Official Lakshya 2.0 Finals Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCPKMv1BliqBdU9KymUhqcV8qxJ2OsgJzc",
    authDomain: "lakshya2finals.firebaseapp.com",
    projectId: "lakshya2finals",
    storageBucket: "lakshya2finals.firebasestorage.app",
    messagingSenderId: "428657842383",
    appId: "1:428657842383:web:55223e3761c426792b7fba",
    measurementId: "G-PWYZJQYBHV"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreInstance;
try {
    firestoreInstance = initializeFirestore(app, {
        ignoreUndefinedProperties: true
    });
} catch {
    firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const storage = getStorage(app);

export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    storageRef,
    uploadBytes,
    getDownloadURL,
    type DocumentData
};
