# 🔧 Guia de Configuração Firebase para VaMove Chat

## 1️⃣ Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar projeto"
3. Digite o nome do projeto (ex: "vamove")
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar"

## 2️⃣ Habilitar Autenticação por Email

1. No painel do Firebase, vá para **Authentication**
2. Clique em **Começar**
3. Selecione **Email/Senha**
4. Habilite a opção "Email/Senha"
5. Clique em **Salvar**

## 3️⃣ Criar Firestore Database

1. Vá para **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha a localização mais próxima
4. Selecione **Iniciar no modo de teste** (depois configuraremos segurança)
5. Clique em **Criar**

## 4️⃣ Criar Storage para Fotos

1. Vá para **Storage**
2. Clique em **Começar**
3. Leia o aviso e clique em **Próximo**
4. Escolha a localização mais próxima
5. Clique em **Concluído**

## 5️⃣ Obter Credenciais

1. Clique no ⚙️ (engrenagem) > **Configurações do projeto**
2. Vá para a aba **Apps**
3. Se não houver apps, clique em **Web** (</>)
4. Digite um nome (ex: "vamove-web")
5. Copie as credenciais que aparecem no código:

```javascript
const firebaseConfig = {
  apiKey: "AIza...", // VITE_FIREBASE_API_KEY
  authDomain: "seu-projeto.firebaseapp.com", // VITE_FIREBASE_AUTH_DOMAIN
  projectId: "seu-projeto", // VITE_FIREBASE_PROJECT_ID
  storageBucket: "seu-projeto.appspot.com", // VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...", // VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123...:web:abc..." // VITE_FIREBASE_APP_ID
};
```

## 6️⃣ Configurar Segurança do Firestore

1. No **Firestore Database**, vá para a aba **Regras**
2. Copie e cole as regras abaixo:

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
      allow create: if request.auth != null;
      
      // Mensagens do chat
      match /messages/{messageId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }

    // Bloqueia acesso aos demais documentos
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Clique em **Publicar**

## 7️⃣ Configurar Segurança do Storage

1. No **Storage**, vá para a aba **Regras**
2. Copie e cole as regras abaixo:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chats/{chatId}/{userId}/{timestamp} {
      allow read, write: if request.auth != null;
    }
    
    // Bloqueia qualquer outro acesso
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Clique em **Publicar**

## 8️⃣ Criar arquivo .env.local

Na raiz do projeto, crie um arquivo `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## ✅ Pronto!

Agora você pode:

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` e comece a usar!

## 🛡️ Segurança

### ⚠️ Importante

- **Nunca** compartilhe seu `VITE_FIREBASE_API_KEY` publicamente
- O `.env.local` **não** deve ser commitado no Git
- Mantenha as regras de Firestore sempre atualizadas
- Revise regularmente os acessos ao banco de dados

### Checklist de Segurança

- [ ] Firestore com regras restritivas
- [ ] Storage com regras restritivas
- [ ] `.env.local` adicionado ao `.gitignore`
- [ ] Autenticação por email habilitada
- [ ] Soft delete implementado (mensagens/chats marcados como deletados)

## 🔍 Monitoramento

Você pode monitorar:
- **Usage**: Firestore > Usage
- **Realtime Database Connections**: Firestore > Real Database
- **Storage Quotas**: Storage > Files

## ❓ Dúvidas Frequentes

**P: Posso usar Realtime Database em vez de Firestore?**
R: Pode, mas Firestore é mais recomendado para este caso de uso.

**P: As fotos são criptografadas?**
R: Estão em HTTPS (em trânsito). Para criptografia em repouso, configure-a no Firebase.

**P: Quantos usuários posso ter?**
R: Conforme o plano do Firebase (Free: 1 GB Firestore, 5 GB Storage)

**P: Posso fazer backup dos dados?**
R: Sim, Firestore > Exportar coleção

---

**Precisa de ajuda?** Veja a [documentação oficial do Firebase](https://firebase.google.com/docs)
