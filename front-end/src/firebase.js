import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQ77dn7MuzRYha_LKXy5f3OMEwJK9t4Jw",
  authDomain: "papakjai-eda88.firebaseapp.com",
  projectId: "papakjai-eda88",
  storageBucket: "papakjai-eda88.firebasestorage.app",
  messagingSenderId: "900400751949",
  appId: "1:900400751949:web:579a4d3d31c9bc32738304",
  measurementId: "G-28NW0RTTP4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;
