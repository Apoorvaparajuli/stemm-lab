import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebase";

export type UserDocument = {
  uid: string;
  email: string;
  firstName: string;
  teamId: string;
  role: "student" | "teacher";
  createdAt?: any;
};

export type TeamDocument = {
  teamId: string;
  teamName: string;
  teamCode: string;
  yearLevel: string;
  members: string[];
  ownerId: string;
  createdAt?: any;
};

export type SubmissionDocument = {
  challengeId: string;
  challengeTitle: string;
  teamId: string;
  resultSummary: string;
  observations: string;
  gpsLocation: { latitude: number; longitude: number } | null;
  createdAt?: any;
};

export const createUserDocument = async (
  data: Omit<UserDocument, "createdAt">,
) => {
  await setDoc(doc(db, "users", data.uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getUserDocument = async (
  uid: string,
): Promise<UserDocument | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDocument;
};

export const updateUserDocument = async (
  uid: string,
  data: Partial<Omit<UserDocument, "uid" | "createdAt">>,
) => {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const createTeamDocument = async (
  data: Omit<TeamDocument, "createdAt">,
) => {
  await setDoc(doc(db, "teams", data.teamId), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getTeamDocument = async (
  teamId: string,
): Promise<TeamDocument | null> => {
  const snap = await getDoc(doc(db, "teams", teamId));
  if (!snap.exists()) return null;
  return snap.data() as TeamDocument;
};

export const updateTeamDocument = async (
  teamId: string,
  data: Partial<Omit<TeamDocument, "teamId" | "createdAt">>,
) => {
  await updateDoc(doc(db, "teams", teamId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const createSubmission = async (
  data: Omit<SubmissionDocument, "createdAt">,
): Promise<string> => {
  const ref = await addDoc(collection(db, "submissions"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getSubmissionsByTeam = async (
  teamId: string,
): Promise<SubmissionDocument[]> => {
  const q = query(
    collection(db, "submissions"),
    where("teamId", "==", teamId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);
};
