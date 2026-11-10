import './ChatList.css';
import { useEffect, useState } from 'react';
import { chatService } from '../services/chatService';
import { Chat } from '../types/index';

interface ChatListProps {
  userId: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  userId,
  onSelectChat,
  onNewChat,
  selectedChatId,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000); // Recarrega a cada 5 segundos
    return () => clearInterval(interval);
  }, [userId]);

  const loadChats = async () => {
    try {
      const userChats = await chatService.getUserChats(userId);
      setChats(userChats);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Tem certeza que deseja deletar esta conversa? Os dados não poderão ser recuperados.')) {
      try {
        await chatService.deleteChat(chatId);
        setChats(chats.filter((c) => c.id !== chatId));
      } catch (error) {
        console.error('Erro ao deletar chat:', error);
        alert('Erro ao deletar conversa');
      }
    }
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Conversas</h2>
        <button className="new-chat-btn" onClick={onNewChat} title="Nova conversa">
          ➕
        </button>
      </div>

      <div className="chat-list-container">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : chats.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma conversa</p>
            <p className="empty-hint">Comece uma nova conversa para começar</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="chat-info">
                <div className="chat-name">
                  {chat.                  participantNames.filter((n: string) => n !== userId).join(', ')}
                </div>
                {chat.lastMessage && (
                  <div className="chat-preview">{chat.lastMessage}</div>
                )}
              </div>
              <button
                className="delete-chat-btn"
                onClick={(e) => handleDeleteChat(chat.id, e)}
                title="Deletar conversa"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
