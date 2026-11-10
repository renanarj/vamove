import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  Timestamp,
  writeBatch,
  limit,
  Query,
  QueryConstraint,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Message, Chat } from '../types/index';

export const chatService = {
  // Criar novo chat entre dois usuários
  createChat: async (userId: string, otherUsername: string): Promise<string> => {
    try {
      // Buscar UID do outro usuário
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', otherUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Usuário não encontrado');
      }

      const otherUserId = querySnapshot.docs[0].id;
      const otherUserName = querySnapshot.docs[0].data().username;

      // Verificar se o chat já existe
      const chatsRef = collection(db, 'chats');
      const existingQ = query(
        chatsRef,
        where('participants', 'array-contains', userId),
      );
      const existingChats = await getDocs(existingQ);

      for (const chatDoc of existingChats.docs) {
        const chatData = chatDoc.data();
        if (
          chatData.participants.includes(otherUserId) &&
          chatData.participants.length === 2
        ) {
          return chatDoc.id;
        }
      }

      // Criar novo chat
      const chatData = {
        participants: [userId, otherUserId],
        participantNames: [userId, otherUserName],
        createdAt: Timestamp.now(),
        isDeleted: false,
      };

      const docRef = await addDoc(chatsRef, chatData);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Obter lista de chats do usuário
  getUserChats: async (userId: string): Promise<Chat[]> => {
    try {
      const chatsRef = collection(db, 'chats');
      const q: any = query(
        chatsRef,
        where('participants', 'array-contains', userId),
        where('isDeleted', '==', false),
        orderBy('lastMessageTime', 'desc'),
      );

      const querySnapshot: any = await getDocs(q);
      const chats: Chat[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data() as any;
        chats.push({
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate(),
          createdAt: data.createdAt.toDate(),
          isDeleted: false,
        });
      }

      return chats;
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      return [];
    }
  },

  // Enviar mensagem
  sendMessage: async (
    chatId: string,
    senderId: string,
    text?: string,
    isEphemeral: boolean = false,
  ): Promise<string> => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      const messageData = {
        senderId,
        text: text || '',
        timestamp: Timestamp.now(),
        isEphemeral,
        ephemeralExpiry: isEphemeral ? Timestamp.fromDate(new Date(Date.now() + 3600000)) : null,
        isDeleted: false,
      };

      const docRef = await addDoc(messagesRef, messageData);

      // Atualizar lastMessage do chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text || '[Foto]',
        lastMessageTime: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Enviar foto com visualização única
  sendPhoto: async (
    chatId: string,
    senderId: string,
    file: File,
    isEphemeral: boolean = true,
  ): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileRef = ref(storage, `chats/${chatId}/${senderId}/${timestamp}`);

      // Upload da foto
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // Criar mensagem com URL da foto
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messageData = {
        senderId,
        imageUrl: downloadURL,
        timestamp: Timestamp.now(),
        isEphemeral,
        ephemeralExpiry: isEphemeral ? Timestamp.fromDate(new Date(Date.now() + 3600000)) : null,
        isDeleted: false,
      };

      const docRef = await addDoc(messagesRef, messageData);

      // Atualizar lastMessage do chat
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: '[Foto]',
        lastMessageTime: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Obter mensagens de um chat
  getMessages: async (chatId: string): Promise<Message[]> => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q: any = query(
        messagesRef,
        where('isDeleted', '==', false),
        orderBy('timestamp', 'asc'),
      );

      const querySnapshot: any = await getDocs(q);
      const messages: Message[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data() as any;
        messages.push({
          id: doc.id,
          chatId,
          senderId: data.senderId,
          text: data.text,
          imageUrl: data.imageUrl,
          isEphemeral: data.isEphemeral,
          ephemeralExpiry: data.ephemeralExpiry?.toDate(),
          timestamp: data.timestamp.toDate(),
          isDeleted: false,
        });
      }

      return messages;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  },

  // Real-time listener para mensagens
  subscribeToMessages: (
    chatId: string,
    callback: (messages: Message[]) => void,
  ): (() => void) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q: any = query(
      messagesRef,
      where('isDeleted', '==', false),
      orderBy('timestamp', 'asc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const messages: Message[] = [];

      snapshot.forEach((doc: any) => {
        const data = doc.data() as any;
        messages.push({
          id: doc.id,
          chatId,
          senderId: data.senderId,
          text: data.text,
          imageUrl: data.imageUrl,
          isEphemeral: data.isEphemeral,
          ephemeralExpiry: data.ephemeralExpiry?.toDate(),
          timestamp: data.timestamp.toDate(),
          isDeleted: false,
        });
      });

      callback(messages);
    });

    return unsubscribe;
  },

  // Deletar mensagem (soft delete)
  deleteMessage: async (chatId: string, messageId: string): Promise<void> => {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists() && messageDoc.data().imageUrl) {
        // Se tem imagem, deletar do Storage também
        const imageRef = ref(storage, messageDoc.data().imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (e) {
          console.warn('Erro ao deletar imagem:', e);
        }
      }

      await updateDoc(messageRef, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        text: null,
        imageUrl: null,
      });
    } catch (error) {
      throw error;
    }
  },

  // Deletar conversa completa (soft delete)
  deleteChat: async (chatId: string): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      // Marcar chat como deletado
      batch.update(doc(db, 'chats', chatId), {
        isDeleted: true,
        deletedAt: Timestamp.now(),
      });

      // Deletar todas as mensagens (soft delete)
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const querySnapshot = await getDocs(messagesRef);

      for (const msgDoc of querySnapshot.docs) {
        const messageData = msgDoc.data();

        // Deletar imagens do Storage
        if (messageData.imageUrl) {
          try {
            const imageRef = ref(storage, messageData.imageUrl);
            await deleteObject(imageRef);
          } catch (e) {
            console.warn('Erro ao deletar imagem:', e);
          }
        }

        batch.update(doc(db, 'chats', chatId, 'messages', msgDoc.id), {
          isDeleted: true,
          deletedAt: Timestamp.now(),
          text: null,
          imageUrl: null,
        });
      }

      await batch.commit();
    } catch (error) {
      throw error;
    }
  },

  // Adicionar emoji à mensagem
  addEmojiReaction: async (
    chatId: string,
    messageId: string,
    emoji: string,
  ): Promise<void> => {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, { emoji });
    } catch (error) {
      throw error;
    }
  },
};
