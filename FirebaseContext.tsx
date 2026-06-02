import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';

/**
 * Firebase Context Type Definition
 */
interface FirebaseContextType {
  // Auth Methods
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, displayName?: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;

  // Firestore Methods
  addDocument: (collectionName: string, data: any) => Promise<string>;
  getDocument: (collectionName: string, docId: string) => Promise<any>;
  getAllDocuments: (collectionName: string) => Promise<any[]>;
  getDocumentsWhere: (collectionName: string, fieldPath: string, operator: any, value: any) => Promise<any[]>;
  updateDocument: (collectionName: string, docId: string, data: any) => Promise<void>;
  deleteDocument: (collectionName: string, docId: string) => Promise<void>;

  // User State
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Create Firebase Context
 */
const FirebaseContext = createContext<FirebaseContextType | null>(null);

/**
 * Firebase Provider Component
 */
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Set up auth state listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile if display name provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }

      // Create user document in Firestore
      if (result.user) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: displayName || email.split('@')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign up';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign out';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send reset email';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    try {
      setError(null);
      if (!currentUser) throw new Error('No user logged in');

      const updateData: any = {};
      if (displayName) updateData.displayName = displayName;
      if (photoURL) updateData.photoURL = photoURL;

      await updateProfile(currentUser, updateData);

      // Also update Firestore user document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: displayName || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL,
        updatedAt: new Date(),
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Add a document to Firestore
   */
  const addDocument = async (collectionName: string, data: any): Promise<string> => {
    try {
      setError(null);
      if (!currentUser) throw new Error('No user logged in');

      const docRef = doc(collection(db, collectionName));
      await setDoc(docRef, {
        ...data,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add document';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Get a single document from Firestore
   */
  const getDocument = async (collectionName: string, docId: string): Promise<any> => {
    try {
      setError(null);
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get document';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Get all documents from a collection
   */
  const getAllDocuments = async (collectionName: string): Promise<any[]> => {
    try {
      setError(null);
      if (!currentUser) throw new Error('No user logged in');

      const q = query(collection(db, collectionName), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get documents';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Get documents with where clause
   */
  const getDocumentsWhere = async (
    collectionName: string,
    fieldPath: string,
    operator: any,
    value: any
  ): Promise<any[]> => {
    try {
      setError(null);
      const q = query(collection(db, collectionName), where(fieldPath, operator, value));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get documents';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Update a document in Firestore
   */
  const updateDocument = async (collectionName: string, docId: string, data: any): Promise<void> => {
    try {
      setError(null);
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update document';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Delete a document from Firestore
   */
  const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
    try {
      setError(null);
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete document';
      setError(errorMessage);
      throw err;
    }
  };

  const value: FirebaseContextType = {
    signIn,
    signUp,
    logout,
    resetPassword,
    updateUserProfile,
    addDocument,
    getDocument,
    getAllDocuments,
    getDocumentsWhere,
    updateDocument,
    deleteDocument,
    currentUser,
    loading,
    error,
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

/**
 * Hook to use Firebase context
 */
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return context;
};
