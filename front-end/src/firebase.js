// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQ77dn7MuzRYha_LKXy5f3OMEwJK9t4Jw",
  authDomain: "papakjai-eda88.firebaseapp.com",
  projectId: "papakjai-eda88",
  storageBucket: "papakjai-eda88.firebasestorage.app",
  messagingSenderId: "900400751949",
  appId: "1:900400751949:web:6f7ba66efade9704738304",
  measurementId: "G-2GGS03NXQ3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Init services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;