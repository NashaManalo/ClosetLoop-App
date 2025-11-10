// firebaseConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB22jajTw3kTE11nkaUsQDOXlbcbLP-FO4",
  authDomain: "closetloopapp.firebaseapp.com",
  projectId: "closetloopapp",
  storageBucket: "closetloopapp.appspot.com",
  messagingSenderId: "662092059115",
  appId: "1:662092059115:web:5bb60b4c28facec9da89ae",
  measurementId: "G-1P4D1M1XY7",
};

// Initialize app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * 👇 Added JSDoc comments so TypeScript knows the types automatically.
 * This removes the “auth implicitly has type any” error.
 */

/** @type {import('firebase/auth').Auth} */
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

/** @type {import('firebase/firestore').Firestore} */
export const db = getFirestore(app);

/** @type {import('firebase/storage').FirebaseStorage} */
export const storage = getStorage(app);

/** @type {import('firebase/auth').Auth} */
export { auth };

