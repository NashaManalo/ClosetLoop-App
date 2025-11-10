import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export const login = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};
