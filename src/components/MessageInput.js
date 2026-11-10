import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './MessageInput.css';
import { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
export const MessageInput = ({ onSendMessage, onSendPhoto, disabled = false, }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isEphemeralPhoto, setIsEphemeralPhoto] = useState(true);
    const fileInputRef = useRef(null);
    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
            setShowEmojiPicker(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
    };
    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onSendPhoto(file, isEphemeralPhoto);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        else {
            alert('Por favor, selecione uma imagem válida');
        }
    };
    return (_jsxs("div", { className: "message-input", children: [showEmojiPicker && (_jsx("div", { className: "emoji-picker-container", children: _jsx(EmojiPicker, { onEmojiClick: handleEmojiClick, searchDisabled: false, skinTonesDisabled: true, width: "100%", height: 300 }) })), _jsxs("div", { className: "input-actions", children: [_jsx("button", { className: "action-btn emoji-btn", onClick: () => setShowEmojiPicker(!showEmojiPicker), title: "Emojis", disabled: disabled, children: "\uD83D\uDE0A" }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handlePhotoSelect, accept: "image/*", style: { display: 'none' }, disabled: disabled }), _jsx("button", { className: "action-btn photo-btn", onClick: () => fileInputRef.current?.click(), title: "Enviar foto", disabled: disabled, children: "\uD83D\uDCF7" }), _jsxs("div", { className: "ephemeral-toggle", children: [_jsx("input", { type: "checkbox", id: "ephemeral-toggle", checked: isEphemeralPhoto, onChange: (e) => setIsEphemeralPhoto(e.target.checked), disabled: disabled }), _jsx("label", { htmlFor: "ephemeral-toggle", title: "Foto com visualiza\u00E7\u00E3o \u00FAnica", children: "\uD83D\uDC41\uFE0F" })] })] }), _jsxs("div", { className: "input-wrapper", children: [_jsx("textarea", { value: message, onChange: (e) => setMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: "Escreva sua mensagem...", disabled: disabled, rows: 1 }), _jsx("button", { className: "send-btn", onClick: handleSend, disabled: disabled || !message.trim(), title: "Enviar mensagem", children: "\u27A4" })] })] }));
};
