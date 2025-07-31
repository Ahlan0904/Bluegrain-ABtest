// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4mU9QwQWmTL2cCFkqWwze9iKWdqKHhIA",
  authDomain: "project-1-92b92.firebaseapp.com",
  projectId: "project-1-92b92",
  storageBucket: "project-1-92b92.firebasestorage.app",
  messagingSenderId: "425692239984",
  appId: "1:425692239984:web:ab8c65aecfc600e82afcb5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
