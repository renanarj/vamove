# VaMove Chat 💬

Um aplicativo de chat **discreto, seguro e completo** para conversas privadas. Desenvolvido com React, TypeScript e Firebase.

## ✨ Características

- 🔐 **Privacidade Total**: Apenas quem criar a conta tem acesso
- 👤 **Autenticação Simples**: Login por nome de usuário e email (sem número de telefone)
- 📱 **Interface Limpa**: Design minimalista e intuitivo
- 📸 **Fotos com Visualização Única**: Compartilhe imagens que desaparecem após visualização
- 😊 **Emojis**: Reações rápidas e expressivas
- 🗑️ **Exclusão Segura**: Delete conversas e mensagens sem deixar rastros
- 🚀 **Real-time**: Chat em tempo real com Firebase Firestore
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile

## 🚀 Como Começar

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- Uma conta Firebase

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/renanarj/vamove.git
   cd vamove
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Crie um novo projeto
   - Habilite autenticação por email/senha
   - Crie um banco de dados Firestore
   - Crie um Storage para fotos
   - Copie suas credenciais

4. **Crie o arquivo `.env.local`**
   ```bash
   cp .env.example .env.local
   ```

5. **Preencha o arquivo `.env.local` com suas credenciais do Firebase**
   ```env
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```

6. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

7. **Acesse a aplicação**
   - Abra seu navegador em `http://localhost:3000`
   - Registre-se com um nome de usuário e email
   - Comece a conversar!

## 📋 Estrutura do Projeto

```
vamove/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Auth.tsx         # Tela de login/registro
│   │   ├── ChatList.tsx     # Lista de conversas
│   │   ├── MessageList.tsx  # Lista de mensagens
│   │   ├── MessageInput.tsx # Input de mensagens
│   │   └── NewChatModal.tsx # Modal para novo chat
│   ├── services/            # Serviços (Firebase)
│   │   ├── authService.ts   # Autenticação
│   │   └── chatService.ts   # Chat e mensagens
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Interfaces
│   ├── config/              # Configurações
│   │   └── firebase.ts      # Firebase config
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Entry point
├── index.html               # HTML root
├── vite.config.ts           # Vite config
├── tsconfig.json            # TypeScript config
├── package.json             # Dependências
└── README.md                # Este arquivo
```

## 🔐 Segurança e Privacidade

### Regras Firestore (Importante!)

Defina as seguintes regras no Firestore para garantir privacidade:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas sua própria conta
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Chats - apenas participantes podem acessar
    match /chats/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      
      // Mensagens do chat
      match /messages/{messageId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

### Regras Storage (Importante!)

No Firebase Storage, configure as regras para permitir uploads apenas de usuários autenticados:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chats/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Funcionalidades

### Autenticação
- ✅ Registro com username e email
- ✅ Login com email e senha
- ✅ Logout seguro
- ✅ Verificação de username duplicado

### Chats
- ✅ Criar novo chat com outro usuário
- ✅ Lista de conversas ativas
- ✅ Buscar usuário por username
- ✅ Deletar conversa completa (soft delete)
- ✅ Marcar como não lido

### Mensagens
- ✅ Enviar mensagens de texto
- ✅ Enviar fotos
- ✅ Fotos com visualização única (ephemeral)
- ✅ Emojis
- ✅ Excluir mensagens individuais
- ✅ Timestamp de mensagens
- ✅ Real-time updates

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript
- **Build**: Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI**: CSS puro + emoji-picker-react
- **Real-time**: Firestore listeners

## 📝 Scripts

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

## 🚨 Notas Importantes

1. **Variáveis de Ambiente**: Certifique-se de criar o arquivo `.env.local` antes de rodar a aplicação
2. **Firestore**: Configure as regras de segurança corretamente (veja seção Segurança)
3. **Storage**: Habilite autenticação no Storage
4. **Soft Delete**: Conversas e mensagens deletadas são marcadas como `isDeleted: true`, não são completamente removidas
5. **Visualização Única**: Fotos com visualização única possuem expiração de 1 hora

## 🐛 Troubleshooting

### "Erro ao conectar ao Firebase"
- Verifique se todas as variáveis de ambiente estão corretas
- Certifique-se de que o projeto Firebase está ativo

### "Usuário não encontrado"
- Verifique se o username foi digitado corretamente
- Usernames são case-sensitive

### "Erro ao enviar foto"
- Certifique-se de que o arquivo é uma imagem válida
- Verifique o limite de tamanho no Storage

## 📄 Licença

MIT - Veja LICENSE para detalhes

## 👨‍💻 Autor

Desenvolvido por Renato com ❤️

---

**⚠️ Importante**: Esta é uma aplicação de chat privado. Use responsavelmente e respeite a privacidade dos outros usuários.