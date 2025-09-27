import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup, // เพิ่ม import นี้
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import { auth, db, googleProvider } from "../firebase";
import { serverTimestamp, doc, setDoc } from "firebase/firestore";

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
      console.log("Profile updated successfully");

      // เขียนข้อมูลลง Firestore หลังจาก authentication สำเร็จ
      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName || '', 
          phoneNumber: phoneNumber || '',
          emailVerified: user.emailVerified, 
          createdAt: serverTimestamp()
        });
        console.log("User data written to Firestore successfully");
      } catch (firestoreError) {
        console.error("Failed to write user data to Firestore:", firestoreError);
        // ไม่ throw error เพราะ user account ถูกสร้างแล้ว
        // แค่ log เอาไว้
      }

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

  const sendVerificationEmail = async (userParam) => {
    if (!userParam) {
      console.error("No user provided to sendVerificationEmail");
      throw new Error("No user provided");
    }

    console.log("Sending verification email to user:", {
      uid: userParam.uid,
      email: userParam.email,
      emailVerified: userParam.emailVerified
    });

    try {
      await sendEmailVerification(userParam);
      console.log("sendEmailVerification completed successfully");
    } catch (err) {
      console.error("Error in sendEmailVerification:", err);
      throw err;
    }
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
    <userAuthContext.Provider 
      value={{ 
        user, 
        signUp, 
        signIn, 
        signInWithGoogle, 
        logOut, 
        resetPassword,
        sendVerificationEmail // เพิ่ม sendVerificationEmail ใน provider value
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}