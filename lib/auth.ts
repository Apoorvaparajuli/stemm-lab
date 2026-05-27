import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { createTeamDocument, createUserDocument } from "./firestore";

export const signUp = async ({
  email,
  password,
  firstName,
  teamName,
  yearLevel,
  members,
}: {
  email: string;
  password: string;
  firstName: string;
  teamName: string;
  yearLevel: string;
  members: string[];
}) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );

  const user = userCredential.user;

  await updateProfile(user, { displayName: firstName.trim() });

  const teamCode = generateTeamCode();

  await createTeamDocument({
    teamId: teamCode,
    teamName: teamName.trim(),
    teamCode,
    yearLevel: yearLevel.trim(),
    members: members.map((m) => m.trim()).filter(Boolean),
    ownerId: user.uid,
  });

  await createUserDocument({
    uid: user.uid,
    email: user.email ?? email.trim().toLowerCase(),
    firstName: firstName.trim(),
    teamId: teamCode,
    role: "student",
  });

  return user;
};

export const logIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );
  return userCredential.user;
};

export const logOut = async () => {
  await signOut(auth);
};

const generateTeamCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `STEMM-${code}`;
};

export const getAuthErrorMessage = (code?: string): string => {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    default:
      return "Something went wrong. Please try again.";
  }
};
