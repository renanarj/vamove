import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types/index';

export const authService = {
  // Registro com username e email
  register: async (username: string, email: string, password: string): Promise<User> => {
    try {
      // Verifica se o username já existe
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('Nome de usuário já existe');
      }

      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Salva dados do usuário no Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        username,
        email,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
      });

      return userData;
    } catch (error) {
      throw error;
    }
  },

  // Login com email e senha
  login: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Busca dados do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados');
      }

      const userData = userDoc.data() as any;
      return {
        uid: userData.uid,
        username: userData.username,
        email: userData.email,
        createdAt: userData.createdAt.toDate(),
      };
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Obter usuário atual
  getCurrentUser: async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data() as any;
      return {
        uid: userData.uid,
        username: userData.username,
        email: userData.email,
        createdAt: userData.createdAt.toDate(),
      };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  // Buscar usuário por username
  getUserByUsername: async (username: string): Promise<User | null> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userData = querySnapshot.docs[0].data() as any;
      return {
        uid: userData.uid,
        username: userData.username,
        email: userData.email,
        createdAt: userData.createdAt.toDate(),
      };
    } catch (error) {
      console.error('Erro ao buscar usuário por username:', error);
      return null;
    }
  },
};
