import './App.css';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './config/firebase';
import { Auth } from './components/Auth.tsx';
import { ChatList } from './components/ChatList.tsx';
import { MessageList } from './components/MessageList.tsx';
import { MessageInput } from './components/MessageInput.tsx';
import { NewChatModal } from './components/NewChatModal.tsx';
import { chatService } from './services/chatService';
import { authService } from './services/authService';
import { Message } from './types/index';

function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userData = await authService.getCurrentUser(user.uid);
        setCurrentUserData(userData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Carregar mensagens quando mudar o chat selecionado
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = chatService.subscribeToMessages(
      selectedChatId,
      setMessages
    );

    return () => unsubscribe();
  }, [selectedChatId]);

  const handleNewChat = async (otherUsername: string) => {
    if (!currentUser) return;

    try {
      if (otherUsername === currentUserData?.username) {
        alert('Você não pode criar um chat consigo mesmo');
        return;
      }

      const chatId = await chatService.createChat(currentUser.uid, otherUsername);
      setSelectedChatId(chatId);
      setShowNewChatModal(false);
    } catch (error: any) {
      alert(error.message || 'Erro ao criar chat');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChatId || !currentUser) return;

    try {
      await chatService.sendMessage(selectedChatId, currentUser.uid, text);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    }
  };

  const handleSendPhoto = async (
    file: File,
    isEphemeral: boolean
  ) => {
    if (!selectedChatId || !currentUser) return;

    try {
      await chatService.sendPhoto(selectedChatId, currentUser.uid, file, isEphemeral);
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      alert('Erro ao enviar foto');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setCurrentUserData(null);
      setSelectedChatId(null);
      setMessages([]);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!currentUser) {
    return <Auth onAuthSuccess={(uid) => {}} />;
  }

  return (
    <div className="app">
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onCreateChat={handleNewChat}
        />
      )}

      <div className="app-container">
        <aside className="sidebar">
          <div className="user-header">
            <div className="user-info">
              <div className="user-avatar">
                {currentUserData?.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="username">{currentUserData?.username}</div>
                <div className="email">{currentUserData?.email}</div>
              </div>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Sair"
            >
              🚪
            </button>
          </div>

          <ChatList
            userId={currentUser.uid}
            onSelectChat={setSelectedChatId}
            onNewChat={() => setShowNewChatModal(true)}
            selectedChatId={selectedChatId || undefined}
          />
        </aside>

        <main className="chat-container">
          {selectedChatId ? (
            <>
              <MessageList
                chatId={selectedChatId}
                currentUserId={currentUser.uid}
                messages={messages}
                onMessagesUpdate={setMessages}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                onSendPhoto={handleSendPhoto}
              />
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <h2>👋 Bem-vindo ao VaMove Chat</h2>
                <p>Selecione uma conversa ou comece uma nova</p>
                <button
                  className="start-chat-btn"
                  onClick={() => setShowNewChatModal(true)}
                >
                  ➕ Começar Nova Conversa
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
