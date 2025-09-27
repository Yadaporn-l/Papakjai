import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// สร้าง Google provider
const googleProvider = new GoogleAuthProvider();

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const signUp = async (email, password, displayName = '', phoneNumber = '') => {
    try {
      console.log("Creating user account...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Updating user profile...");
      await updateProfile(user, { displayName });

      try {
        console.log("Writing user data to Firestore...");
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
      }

      console.log("User signed up successfully");
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

      // บันทึกข้อมูล user ลง Firestore (ถ้ายังไม่มี)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp()
      }, { merge: true }); // merge: true เพื่อไม่เขียนทับข้อมูลเก่า

      console.log("User signed in with Google successfully");
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
      console.log("Verification email sent successfully");
    } catch (err) {
      console.error("Error sending verification email:", err);
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
        sendVerificationEmail
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}