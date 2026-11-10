import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Auth.css';
import { useState } from 'react';
import { authService } from '../../services/authService';
export const Auth = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                const user = await authService.login(email, password);
                onAuthSuccess(user.uid);
            }
            else {
                if (!username.trim()) {
                    setError('Nome de usuário é obrigatório');
                    setLoading(false);
                    return;
                }
                const user = await authService.register(username, email, password);
                onAuthSuccess(user.uid);
            }
        }
        catch (err) {
            setError(err.message || 'Erro ao autenticar');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-box", children: [_jsx("h1", { className: "auth-title", children: "\uD83D\uDCF1 VaMove Chat" }), _jsx("p", { className: "auth-subtitle", children: "Chat discreto e seguro" }), error && _jsx("div", { className: "auth-error", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [!isLogin && (_jsx("div", { className: "form-group", children: _jsx("input", { type: "text", placeholder: "Nome de usu\u00E1rio", value: username, onChange: (e) => setUsername(e.target.value), disabled: loading, required: true }) })), _jsx("div", { className: "form-group", children: _jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), disabled: loading, required: true }) }), _jsx("div", { className: "form-group", children: _jsx("input", { type: "password", placeholder: "Senha", value: password, onChange: (e) => setPassword(e.target.value), disabled: loading, required: true }) }), _jsx("button", { type: "submit", className: "auth-button", disabled: loading, children: loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Registrar' })] }), _jsx("div", { className: "auth-toggle", children: _jsxs("p", { children: [isLogin ? 'Não tem conta?' : 'Já tem conta?', ' ', _jsx("button", { type: "button", onClick: () => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    setUsername('');
                                    setEmail('');
                                    setPassword('');
                                }, children: isLogin ? 'Registre-se' : 'Faça login' })] }) })] }) }));
};
