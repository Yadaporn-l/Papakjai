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
import { serverTimestamp, doc, setDoc } from "firebase/firestore";

// สร้าง Google provider
// const googleProvider = new GoogleAuthProvider();

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const signUp = async (email, password, displayName = '' ) => {
    try {
      console.log("Creating user account...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Updating user profile...");
      await updateProfile(user, { displayName });

      // ไม่บันทึกข้อมูลลง Firestore ในขั้นตอนนี้
      // จะบันทึกหลังจาก verify email แล้วเท่านั้น
      console.log("User account created, waiting for email verification");
      
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

      // Google accounts are automatically verified
      // บันทึกข้อมูล user ลง Firestore
      await saveUserToFirestore(user, {
        signInMethod: 'google'
      });

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

  // ฟังก์ชันส่ง email verification
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

  // ฟังก์ชันสำหรับบันทึกข้อมูล user ลง Firestore หลัง verify email
  const saveUserToFirestore = async (user, additionalData = {}) => {
    try {
      console.log("Saving verified user to Firestore...");
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        // phoneNumber: user.phoneNumber || '',
        // photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        verifiedAt: serverTimestamp(), // เพิ่มเวลาที่ verify
        ...additionalData // ข้อมูลเพิ่มเติม
      }, { merge: true });
      
      console.log("User data saved to Firestore successfully");
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับลบ user ที่ไม่ verify email
  const deleteUnverifiedUser = async (userParam) => {
    try {
      if (userParam && !userParam.emailVerified) {
        console.log("Deleting unverified user:", userParam.email);
        await userParam.delete();
        console.log("Unverified user deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting unverified user:", error);
      // ไม่ throw error เพราะไม่อยากให้กระทบกับ UX
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // ตรวจสอบว่า user verify email แล้วหรือไม่
      if (currentUser && !currentUser.emailVerified) {
        console.log("User not verified, monitoring...");
        // สามารถเพิ่มการ sign out อัตโนมัติได้ถ้าต้องการ
      }
      
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
        sendVerificationEmail,
        saveUserToFirestore,
        deleteUnverifiedUser
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}