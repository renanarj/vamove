import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import './App.css';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { Auth } from './components/Auth';
import { ChatList } from './components/ChatList';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { NewChatModal } from './components/NewChatModal';
import { chatService } from './services/chatService';
import { authService } from './services/authService';
function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
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
        const unsubscribe = chatService.subscribeToMessages(selectedChatId, setMessages);
        return () => unsubscribe();
    }, [selectedChatId]);
    const handleNewChat = async (otherUsername) => {
        if (!currentUser)
            return;
        try {
            if (otherUsername === currentUserData?.username) {
                alert('Você não pode criar um chat consigo mesmo');
                return;
            }
            const chatId = await chatService.createChat(currentUser.uid, otherUsername);
            setSelectedChatId(chatId);
            setShowNewChatModal(false);
        }
        catch (error) {
            alert(error.message || 'Erro ao criar chat');
        }
    };
    const handleSendMessage = async (text) => {
        if (!selectedChatId || !currentUser)
            return;
        try {
            await chatService.sendMessage(selectedChatId, currentUser.uid, text);
        }
        catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem');
        }
    };
    const handleSendPhoto = async (file, isEphemeral) => {
        if (!selectedChatId || !currentUser)
            return;
        try {
            await chatService.sendPhoto(selectedChatId, currentUser.uid, file, isEphemeral);
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };
    if (loading) {
        return _jsx("div", { className: "loading-screen", children: "Carregando..." });
    }
    if (!currentUser) {
        return _jsx(Auth, { onAuthSuccess: (uid) => { } });
    }
    return (_jsxs("div", { className: "app", children: [showNewChatModal && (_jsx(NewChatModal, { onClose: () => setShowNewChatModal(false), onCreateChat: handleNewChat })), _jsxs("div", { className: "app-container", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "user-header", children: [_jsxs("div", { className: "user-info", children: [_jsx("div", { className: "user-avatar", children: currentUserData?.username.charAt(0).toUpperCase() }), _jsxs("div", { className: "user-details", children: [_jsx("div", { className: "username", children: currentUserData?.username }), _jsx("div", { className: "email", children: currentUserData?.email })] })] }), _jsx("button", { className: "logout-btn", onClick: handleLogout, title: "Sair", children: "\uD83D\uDEAA" })] }), _jsx(ChatList, { userId: currentUser.uid, onSelectChat: setSelectedChatId, onNewChat: () => setShowNewChatModal(true), selectedChatId: selectedChatId || undefined })] }), _jsx("main", { className: "chat-container", children: selectedChatId ? (_jsxs(_Fragment, { children: [_jsx(MessageList, { chatId: selectedChatId, currentUserId: currentUser.uid, messages: messages, onMessagesUpdate: setMessages }), _jsx(MessageInput, { onSendMessage: handleSendMessage, onSendPhoto: handleSendPhoto })] })) : (_jsx("div", { className: "no-chat-selected", children: _jsxs("div", { className: "empty-state", children: [_jsx("h2", { children: "\uD83D\uDC4B Bem-vindo ao VaMove Chat" }), _jsx("p", { children: "Selecione uma conversa ou comece uma nova" }), _jsx("button", { className: "start-chat-btn", onClick: () => setShowNewChatModal(true), children: "\u2795 Come\u00E7ar Nova Conversa" })] }) })) })] })] }));
}
export default App;
