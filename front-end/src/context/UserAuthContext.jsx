import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification, // Import sendEmailVerification

} from "firebase/auth";
import { auth, db, googleProvider } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const signUp = async (email, password, displayName = '', phoneNumber = '') => {
    try {
      // สร้าง user account ก่อน
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // อัพเดทโปรไฟล์ใน Firebase Auth
      await updateProfile(user, { displayName });

      // เขียนข้อมูลลง Firestore หลังจาก authentication สำเร็จ
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || '', // ใช้ displayName ตามเดิม
        phoneNumber: phoneNumber || '',
        createdAt: new Date()
      });

      console.log("User signed up and data written to Firestore");
      return userCredential;
    } catch (err) {
      console.error("Error in signUp:", err);
      throw err;
    }
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Optional: Save user data to Firestore (similar to signUp)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        createdAt: new Date()
      }, { merge: true }); // merge: true to avoid overwriting existing data

      console.log("User signed in with Google and data written to Firestore");
      return result;
    } catch (err) {
      console.error("Error in signInWithGoogle:", err);
      throw err;
    }
  };

  const logOut = () => {
    return signOut(auth);
  };

  const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log("Auth state changed:", currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider value={{ user, signUp, signIn, signInWithGoogle, logOut, resetPassword }}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}