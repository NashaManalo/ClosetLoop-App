import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export const signUp = async (
  firstName,
  lastName,
  username,
  email,
  region,
  municipality,
  barangay,
  password,
  birthday // ✅ Make sure this is included
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // ✅ Ensure birthday is stored safely even if null or string
  let birthdayString = null;
  if (birthday && birthday instanceof Date && !isNaN(birthday)) {
    birthdayString = birthday.toISOString().split("T")[0];
  } else if (typeof birthday === "string") {
    birthdayString = birthday;
  }

  await setDoc(doc(db, "users", user.uid), {
    firstName,
    lastName,
    username,
    email,
    location: {
      region,
      municipality,
      barangay,
    },
    birthday: birthdayString, // ✅ safe value
    uid: user.uid,
  });
};
