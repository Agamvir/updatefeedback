import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getAuth,onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs ,getDoc,doc,updateDoc} from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';

import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB6HyBg_kE-ZcFNKXYrCu6zYl727XJnRU0",
    authDomain: "updatefeedback-707de.firebaseapp.com",
    projectId: "updatefeedback-707de",
    storageBucket: "updatefeedback-707de.firebasestorage.app",
    messagingSenderId: "460925685822",
    appId: "1:460925685822:web:93060b65bcc42d232ec16f",
    measurementId: "G-V0HN1P9Y4W"
};
    // I

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);  // Ensure `app` is initialized first
    const auth = getAuth(app);
    export { auth, onAuthStateChanged, db,signInWithEmailAndPassword ,createUserWithEmailAndPassword,ref, set, push, get, child};
    export { collection, addDoc, getDocs, getDoc,doc, updateDoc };