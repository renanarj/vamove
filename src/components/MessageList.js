import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './MessageList.css';
import { useEffect, useRef, useState } from 'react';
import { chatService } from '../../services/chatService';
export const MessageList = ({ chatId, currentUserId, messages, onMessagesUpdate, }) => {
    const messagesEndRef = useRef(null);
    const [viewedEphemeral, setViewedEphemeral] = useState(new Set());
    useEffect(() => {
        const unsubscribe = chatService.subscribeToMessages(chatId, onMessagesUpdate);
        return () => unsubscribe();
    }, [chatId, onMessagesUpdate]);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleDeleteMessage = async (messageId) => {
        if (confirm('Tem certeza que deseja deletar esta mensagem?')) {
            try {
                await chatService.deleteMessage(chatId, messageId);
            }
            catch (error) {
                console.error('Erro ao deletar mensagem:', error);
                alert('Erro ao deletar mensagem');
            }
        }
    };
    const handleImageLoad = (messageId) => {
        if (messages.find(m => m.id === messageId)?.isEphemeral) {
            setViewedEphemeral(prev => new Set(prev).add(messageId));
        }
    };
    const isEphemeralViewed = (messageId) => viewedEphemeral.has(messageId);
    return (_jsxs("div", { className: "message-list", children: [messages.length === 0 ? (_jsxs("div", { className: "empty-messages", children: [_jsx("p", { children: "Nenhuma mensagem ainda" }), _jsx("p", { className: "hint", children: "Comece a conversa!" })] })) : (messages.map((message) => (_jsxs("div", { className: `message ${message.senderId === currentUserId ? 'sent' : 'received'}`, children: [_jsxs("div", { className: "message-content", children: [message.imageUrl && (_jsxs("div", { className: "image-container", children: [_jsx("img", { src: message.imageUrl, alt: "Mensagem com foto", onLoad: () => handleImageLoad(message.id), className: message.isEphemeral ? 'ephemeral' : '' }), message.isEphemeral && isEphemeralViewed(message.id) && (_jsx("div", { className: "ephemeral-badge", children: "\uD83D\uDCCB Visualiza\u00E7\u00E3o \u00FAnica" }))] })), message.text && (_jsx("div", { className: "message-text", children: message.text })), _jsxs("div", { className: "message-footer", children: [_jsx("span", { className: "timestamp", children: message.timestamp.toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }) }), message.emoji && _jsx("span", { className: "emoji", children: message.emoji })] })] }), message.senderId === currentUserId && (_jsx("button", { className: "delete-btn", onClick: () => handleDeleteMessage(message.id), title: "Deletar mensagem", children: "\uD83D\uDDD1\uFE0F" }))] }, message.id)))), _jsx("div", { ref: messagesEndRef })] }));
};
