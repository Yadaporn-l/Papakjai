import { createContext ,useContext,useEffect,useState} from "react"
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "firebase/auth"

import {auth} from '../firebase'
const UserAuthContext = createContext();

export function UserAuthProvider({children}) {

    const [user,setUser] = useState({});
    function logIn(email,password){
        return signInWithEmailAndPassword(auth,email,password);
    }

    function signUp(email,password){
        return createUserWithEmailAndPassword(auth,email,password);
    }
    function logOut(){
        return signOut(auth);
    }
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,(currentuser)=>{
            console.log("Auth",currentuser);
            setUser(currentuser);
        })
    },[])
    
  return (
    <UserAuthContext.Provider value={{user, logIn, signUp,logOut}}>
        {children}
    </UserAuthContext.Provider>
  )
} 

export function userUserAuth(){
    return useContext(UserAuthContext);
}