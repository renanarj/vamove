# 🏗️ Arquitetura Técnica - VaMove Chat

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Cliente (Browser)                  │
│  ┌───────────────────────────────────────────────┐  │
│  │        React + TypeScript Application         │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │      Componentes UI                    │  │  │
│  │  │  - Auth        (Login/Registro)        │  │  │
│  │  │  - ChatList    (Lista de conversas)    │  │  │
│  │  │  - MessageList (Mensagens)             │  │  │
│  │  │  - MessageInput (Input de msg)         │  │  │
│  │  │  - NewChatModal (Novo chat)            │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │      Serviços de Negócio                │  │  │
│  │  │  - authService (Auth)                  │  │  │
│  │  │  - chatService (Chat + Mensagens)      │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │      Firebase SDK                      │  │  │
│  │  │  - auth (Authentication)               │  │  │
│  │  │  - firestore (Database)                │  │  │
│  │  │  - storage (Files)                     │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────┐          ┌────▼──────┐
   │ Firebase  │          │  Firebase  │
   │   Auth    │          │ Firestore  │
   │           │          │ Database   │
   └───────────┘          └────┬──────┘
                                │
                          ┌─────▼─────┐
                          │  Firebase  │
                          │  Storage   │
                          │ (Imagens)  │
                          └────────────┘
```

---

## Stack Tecnológico

### Frontend
- **React 18.2**: Framework UI
- **TypeScript 5.2**: Type-safe JavaScript
- **Vite 5.0**: Build tool ultrarrápido
- **CSS Puro**: Sem dependências de CSS framework

### Backend
- **Firebase Authentication**: Autenticação com email/senha
- **Firestore**: Banco de dados NoSQL em tempo real
- **Firebase Storage**: Armazenamento de arquivos (fotos)

### Dependências Principais
```json
{
  "react": "^18.2.0",
  "firebase": "^10.7.0",
  "emoji-picker-react": "^4.5.14",
  "axios": "^1.6.5"
}
```

---

## Estrutura de Dados

### Firestore Collections

#### `users/`
```
users/
├── [uid]
│   ├── username (string, unique)
│   ├── email (string)
│   └── createdAt (timestamp)
```

#### `chats/`
```
chats/
├── [chatId]
│   ├── participants (array<string>) // Array de UIDs
│   ├── participantNames (array<string>) // Nomes dos participantes
│   ├── lastMessage (string)
│   ├── lastMessageTime (timestamp)
│   ├── createdAt (timestamp)
│   ├── isDeleted (boolean)
│   ├── deletedAt (timestamp)
│   │
│   └── messages/
│       ├── [messageId]
│       │   ├── senderId (string)
│       │   ├── text (string, optional)
│       │   ├── imageUrl (string, optional)
│       │   ├── isEphemeral (boolean)
│       │   ├── ephemeralExpiry (timestamp)
│       │   ├── timestamp (timestamp)
│       │   ├── isDeleted (boolean)
│       │   ├── deletedAt (timestamp)
│       │   └── emoji (string, optional)
```

### Firebase Storage
```
chats/
├── [chatId]/
│   └── [senderId]/
│       └── [timestamp]_image.jpg
```

---

## Fluxo de Dados

### 1. Autenticação
```
User Input
    ↓
authService.register() / authService.login()
    ↓
Firebase Auth.createUserWithEmailAndPassword()
    ↓
Firebase Firestore: create/read user document
    ↓
Session iniciada
```

### 2. Criar Chat
```
Usuário seleciona novo chat
    ↓
NewChatModal pede username
    ↓
chatService.createChat(userId, otherUsername)
    ↓
Busca UID do outro usuário
    ↓
Cria documento em Firestore: chats/[chatId]
    ↓
Chat selecionado
```

### 3. Enviar Mensagem
```
Usuário digita e clica enviar
    ↓
MessageInput chama onSendMessage()
    ↓
chatService.sendMessage()
    ↓
Firebase Firestore: adiciona documento em chats/[chatId]/messages/
    ↓
Real-time listener dispara
    ↓
MessageList atualiza com mensagem nova
```

### 4. Enviar Foto
```
Usuário clica 📷 e seleciona imagem
    ↓
MessageInput chama onSendPhoto()
    ↓
chatService.sendPhoto()
    ↓
uploadBytes() → Firebase Storage
    ↓
getDownloadURL() → URL pública
    ↓
Cria documento em Firestore com imageUrl
    ↓
Real-time listener dispara
    ↓
MessageList exibe foto
```

### 5. Deletar Chat (Soft Delete)
```
Usuário clica 🗑️ em conversa
    ↓
Confirmação
    ↓
chatService.deleteChat()
    ↓
Batch update Firestore:
  - Chat: isDeleted = true
  - Mensagens: isDeleted = true
  - Storage: deleteObject() para cada foto
    ↓
ChatList recarrega (filtra isDeleted = false)
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários só acessam sua própria conta
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Chats - apenas participantes
    match /chats/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      
      // Mensagens - apenas participantes do chat
      match /messages/{messageId} {
        allow read, write: if request.auth.uid in 
          get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }

    // Tudo o mais: negado
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Ciclo de Vida de Componentes

### Auth Component
```
Render → Input → Submit → authService → Firebase → Callback
```

### ChatList Component
```
Mount → getUserChats() → setState → Render
       → Interval refresh a cada 5s
```

### MessageList Component
```
Mount → subscribeToMessages() (real-time listener)
     → Render mensagens
     → onCleanup → unsubscribe
```

### MessageInput Component
```
Render → User input → onSendMessage/onSendPhoto → chatService
       → Firebase operação → ChatList refresha
```

---

## Performance Optimizations

### Implementadas
✅ Real-time listeners (não polling)
✅ Soft delete (sem exclusão real)
✅ Vite code splitting
✅ CSS crítico inline
✅ Lazy loading implícito

### Possíveis Melhorias
- [ ] Virtual scrolling para grandes listas
- [ ] React.memo() em componentes pesados
- [ ] useCallback() para callbacks
- [ ] Image compression antes de upload
- [ ] Service Worker (PWA)
- [ ] Compression gzip (servidor)

---

## Segurança

### Implementado
✅ HTTPS obrigatório (Firebase)
✅ Autenticação Firebase
✅ Firestore rules restritivas
✅ Storage rules restritivas
✅ Soft delete (não hard delete)
✅ Senhas hashadas (Firebase)

### Recomendações Adicionais
- [ ] Criptografia end-to-end (extra)
- [ ] 2FA (autenticador)
- [ ] Rate limiting (backend)
- [ ] CAPTCHA (registro)
- [ ] DDoS protection (CDN)

---

## Escalabilidade

### Limites Firebase Free Tier
- **Firestore**: 1 GB storage
- **Storage**: 5 GB/mês download
- **Conexões**: Ilimitadas
- **Requisições**: Até ~25k/dia leitura

### Quando Escalar
- > 1 GB de dados → Upgrade plano
- > 100.000 mensagens/dia → Otimizar queries
- > 1000 usuários simultâneos → Considerar réplicas

### Estratégia de Scaling
1. Usar Firebase Pay-as-you-go (depois free tier)
2. Implementar cache local (localStorage)
3. Arquivar mensagens antigas
4. Usar CDN para Storage

---

## Deploy

### Produção
```
npm run build → dist/
  ↓
Firebase Hosting / Vercel / Netlify
  ↓
URL pública
  ↓
Banco de dados em produção
```

### CI/CD
```
Push → GitHub
  ↓
Webhook → Build Pipeline
  ↓
Testes automáticos
  ↓
Deploy automático
```

---

## Monitoramento

### Firebase Console
- Real Database: Estatísticas de leitura/escrita
- Storage: Uso de espaço
- Authentication: Usuários ativos
- Rules Simulator: Testar segurança

### Métricas Importantes
- Mensagens/dia
- Usuários ativos
- Uso de storage
- Custo estimado

---

## Troubleshooting Técnico

### "Documento não encontrado"
- Verifique Firestore rules
- Confirme que participante está em `participants` array

### "Foto não envia"
- Verificar Storage rules
- Confirme autenticação ativa
- Revise limite de tamanho

### "Mensagens não atualizam"
- Verifique listener subscription
- Confirme que isDeleted é filtrado
- Cheque connection status

---

## Referências

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [React Hooks API](https://react.dev/reference/react/hooks)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Desenvolvido com ❤️**
