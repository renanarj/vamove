import './NewChatModal.css';
import { useState } from 'react';
import { authService } from '../services/authService';

interface NewChatModalProps {
  onClose: () => void;
  onCreateChat: (chatId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  onClose,
  onCreateChat,
}) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Conversa</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nome de usuário</label>
            <input
              id="username"
              type="text"
              placeholder="Digite o nome de usuário"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUserNotFound(false);
              }}
              disabled={loading}
              autoFocus
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {userNotFound && (
            <div className="error-message">
              Usuário "{username}" não encontrado
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !username.trim()}
            >
              {loading ? 'Procurando...' : 'Começar Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
