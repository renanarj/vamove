import './MessageInput.css';
import { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendPhoto: (file: File, isEphemeral: boolean) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendPhoto,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEphemeralPhoto, setIsEphemeralPhoto] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onSendPhoto(file, isEphemeralPhoto);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      alert('Por favor, selecione uma imagem válida');
    }
  };

  return (
    <div className="message-input">
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            searchDisabled={false}
            skinTonesDisabled={true}
            width="100%"
            height={300}
          />
        </div>
      )}

      <div className="input-actions">
        <button
          className="action-btn emoji-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Emojis"
          disabled={disabled}
        >
          😊
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoSelect}
          accept="image/*"
          style={{ display: 'none' }}
          disabled={disabled}
        />

        <button
          className="action-btn photo-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Enviar foto"
          disabled={disabled}
        >
          📷
        </button>

        <div className="ephemeral-toggle">
          <input
            type="checkbox"
            id="ephemeral-toggle"
            checked={isEphemeralPhoto}
            onChange={(e) => setIsEphemeralPhoto(e.target.checked)}
            disabled={disabled}
          />
          <label htmlFor="ephemeral-toggle" title="Foto com visualização única">
            👁️
          </label>
        </div>
      </div>

      <div className="input-wrapper">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escreva sua mensagem..."
          disabled={disabled}
          rows={1}
        />

        <button
          className="send-btn"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          title="Enviar mensagem"
        >
          ➤
        </button>
      </div>
    </div>
  );
};
