import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase'; // ตรวจสอบว่าคุณมี db ที่ export จาก firebase

const UserAuthContext = createContext();

export function UserAuthProvider({ children }) {
    const [user, setUser] = useState({});
    const [userData, setUserData] = useState(null); // สำหรับเก็บข้อมูลเพิ่มเติมจาก Firestore

    async function logIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // ดึงข้อมูลเพิ่มเติมจาก Firestore
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            }
            return userCredential;
        } catch (error) {
            throw error;
        }
    }

    async function signUp(email, password, additionalData = {}) {
        try {
            // สร้างผู้ใช้ใน Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // บันทึกข้อมูลเพิ่มเติมลง Firestore
            const userDoc = {
                uid: userCredential.user.uid,
                email: email,
                displayName: additionalData.displayName || "",
                createdAt: new Date(),
                ...additionalData // ข้อมูลเพิ่มเติมอื่นๆ
            };
            
            await setDoc(doc(db, "users", userCredential.user.uid), userDoc);
            setUserData(userDoc); // เก็บข้อมูลใน state
            
            return userCredential;
        } catch (error) {
            throw error;
        }
    }

    async function logOut() {
        try {
            await signOut(auth);
            setUserData(null); // ล้างข้อมูลเมื่อ logout
        } catch (error) {
            throw error;
        }
    }

    async function updateUserData(uid, data) {
        try {
            await setDoc(doc(db, "users", uid), data, { merge: true });
            setUserData(prev => ({ ...prev, ...data })); // อัปเดต state
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("Auth", currentUser);
            setUser(currentUser);
            
            // หากมีผู้ใช้ login ให้ดึงข้อมูลจาก Firestore
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUserData(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserAuthContext.Provider value={{ 
            user, 
            userData, 
            logIn, 
            signUp, 
            logOut, 
            updateUserData 
        }}>
            {children}
        </UserAuthContext.Provider>
    );
}



export function useUserAuth() {
    return useContext(UserAuthContext);
}