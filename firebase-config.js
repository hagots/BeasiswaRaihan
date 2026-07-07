// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIdtHcjKjeROz2hjGb7ojwCoUmUZxKMOY",
  authDomain: "beasiswa-raihan.firebaseapp.com",
  projectId: "beasiswa-raihan",
  storageBucket: "beasiswa-raihan.firebasestorage.app",
  messagingSenderId: "550186754487",
  appId: "1:550186754487:web:82cc91bba3852843ebc832"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };