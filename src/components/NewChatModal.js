import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './NewChatModal.css';
import { useState } from 'react';
import { authService } from '../../services/authService';
export const NewChatModal = ({ onClose, onCreateChat, }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setUserNotFound(false);
        setLoading(true);
        try {
            const user = await authService.getUserByUsername(username.trim());
            if (!user) {
                setUserNotFound(true);
                setLoading(false);
                return;
            }
            // Aqui você precisaria passar o userId do usuário atual
            // Esta é uma limitação que será resolvida no contexto da app principal
            onClose();
        }
        catch (err) {
            setError(err.message || 'Erro ao buscar usuário');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: "Nova Conversa" }), _jsx("button", { className: "modal-close", onClick: onClose, children: "\u2715" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "username", children: "Nome de usu\u00E1rio" }), _jsx("input", { id: "username", type: "text", placeholder: "Digite o nome de usu\u00E1rio", value: username, onChange: (e) => {
                                        setUsername(e.target.value);
                                        setUserNotFound(false);
                                    }, disabled: loading, autoFocus: true, required: true })] }), error && _jsx("div", { className: "error-message", children: error }), userNotFound && (_jsxs("div", { className: "error-message", children: ["Usu\u00E1rio \"", username, "\" n\u00E3o encontrado"] })), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { type: "button", className: "btn btn-secondary", onClick: onClose, disabled: loading, children: "Cancelar" }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: loading || !username.trim(), children: loading ? 'Procurando...' : 'Começar Chat' })] })] })] }) }));
};
