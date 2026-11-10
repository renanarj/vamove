import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './ChatList.css';
import { useEffect, useState } from 'react';
import { chatService } from '../../services/chatService';
export const ChatList = ({ userId, onSelectChat, onNewChat, selectedChatId, }) => {
    const [chats, setChats] = useState([]);
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
        }
        catch (error) {
            console.error('Erro ao carregar chats:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteChat = async (chatId, e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja deletar esta conversa? Os dados não poderão ser recuperados.')) {
            try {
                await chatService.deleteChat(chatId);
                setChats(chats.filter((c) => c.id !== chatId));
            }
            catch (error) {
                console.error('Erro ao deletar chat:', error);
                alert('Erro ao deletar conversa');
            }
        }
    };
    return (_jsxs("div", { className: "chat-list", children: [_jsxs("div", { className: "chat-list-header", children: [_jsx("h2", { children: "Conversas" }), _jsx("button", { className: "new-chat-btn", onClick: onNewChat, title: "Nova conversa", children: "\u2795" })] }), _jsx("div", { className: "chat-list-container", children: loading ? (_jsx("div", { className: "loading", children: "Carregando..." })) : chats.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("p", { children: "Nenhuma conversa" }), _jsx("p", { className: "empty-hint", children: "Comece uma nova conversa para come\u00E7ar" })] })) : (chats.map((chat) => (_jsxs("div", { className: `chat-item ${selectedChatId === chat.id ? 'active' : ''}`, onClick: () => onSelectChat(chat.id), children: [_jsxs("div", { className: "chat-info", children: [_jsx("div", { className: "chat-name", children: chat.participantNames.filter(n => n !== userId).join(', ') }), chat.lastMessage && (_jsx("div", { className: "chat-preview", children: chat.lastMessage }))] }), _jsx("button", { className: "delete-chat-btn", onClick: (e) => handleDeleteChat(chat.id, e), title: "Deletar conversa", children: "\uD83D\uDDD1\uFE0F" })] }, chat.id)))) })] }));
};
