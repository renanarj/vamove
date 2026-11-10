import './MessageList.css';
import { useEffect, useRef, useState } from 'react';
import { Message } from '../types/index';
import { chatService } from '../services/chatService';

interface MessageListProps {
  chatId: string;
  currentUserId: string;
  messages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  chatId,
  currentUserId,
  messages,
  onMessagesUpdate,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [viewedEphemeral, setViewedEphemeral] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages(chatId, onMessagesUpdate);
    return () => unsubscribe();
  }, [chatId, onMessagesUpdate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('Tem certeza que deseja deletar esta mensagem?')) {
      try {
        await chatService.deleteMessage(chatId, messageId);
      } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        alert('Erro ao deletar mensagem');
      }
    }
  };

  const handleImageLoad = (messageId: string) => {
    if (messages.find(m => m.id === messageId)?.isEphemeral) {
      setViewedEphemeral(prev => new Set(prev).add(messageId));
    }
  };

  const isEphemeralViewed = (messageId: string) => viewedEphemeral.has(messageId);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-messages">
          <p>Nenhuma mensagem ainda</p>
          <p className="hint">Comece a conversa!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              {message.imageUrl && (
                <div className="image-container">
                  <img
                    src={message.imageUrl}
                    alt="Mensagem com foto"
                    onLoad={() => handleImageLoad(message.id)}
                    className={message.isEphemeral ? 'ephemeral' : ''}
                  />
                  {message.isEphemeral && isEphemeralViewed(message.id) && (
                    <div className="ephemeral-badge">📋 Visualização única</div>
                  )}
                </div>
              )}

              {message.text && (
                <div className="message-text">
                  {message.text}
                </div>
              )}

              <div className="message-footer">
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {message.emoji && <span className="emoji">{message.emoji}</span>}
              </div>
            </div>

            {message.senderId === currentUserId && (
              <button
                className="delete-btn"
                onClick={() => handleDeleteMessage(message.id)}
                title="Deletar mensagem"
              >
                🗑️
              </button>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
