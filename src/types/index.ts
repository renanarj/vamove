export interface User {
  uid: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  isEphemeral?: boolean; // Visualização única
  ephemeralExpiry?: Date; // Quando o conteúdo expira
  timestamp: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  emoji?: string;
}

export interface Chat {
  id: string;
  participants: string[]; // Array de UIDs dos participantes
  participantNames: string[]; // Nomes dos participantes
  lastMessage?: string;
  lastMessageTime?: Date;
  createdAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export interface ChatSession {
  chatId: string;
  userId: string;
  lastRead: Date;
}
