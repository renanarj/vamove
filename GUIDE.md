# 📚 Guia Completo - VaMove Chat

## 🎯 O que é VaMove Chat?

VaMove Chat é uma aplicação web de mensagens **privada, discreta e segura** com as seguintes características:

- 🔐 **100% Privado**: Apenas você controla seu acesso
- 💬 **Chat em Tempo Real**: Conversas instantâneas
- 📸 **Fotos com Visualização Única**: Imagens que desaparecem após visualização
- 😊 **Emojis Completos**: Reações expressivas
- 🗑️ **Exclusão Total**: Delete tudo sem deixar rastros
- 🚀 **Rápido e Leve**: Interface responsiva

---

## ⚡ Início Rápido

### 1. Instalar
```bash
git clone https://github.com/renanarj/vamove.git
cd vamove
npm install
```

### 2. Configurar Firebase
Veja [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) para instruções detalhadas.

### 3. Criar .env.local
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais Firebase
```

### 4. Rodar Localmente
```bash
npm run dev
# Acesse http://localhost:3000
```

### 5. Deploy
Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções de publicação.

---

## 👤 Usando a Aplicação

### Registrar
1. Clique em "Registre-se"
2. Digite um **nome de usuário único** (será usado para conversas)
3. Digite seu **email**
4. Digite sua **senha** (use uma senha forte!)
5. Clique em "Registrar"

### Fazer Login
1. Digite seu **email**
2. Digite sua **senha**
3. Clique em "Entrar"

### Iniciar Conversa
1. Clique no botão ➕ "Nova Conversa"
2. Digite o **nome de usuário** da pessoa
3. Clique em "Começar Chat"
4. Comece a conversar!

### Enviar Mensagens

#### Texto
- Digite a mensagem
- Pressione `Enter` ou clique em ➤

#### Fotos
1. Clique no ícone 📷
2. Selecione a imagem
3. A foto será enviada automaticamente
4. Com 👁️ ativo = visualização única (1 hora)
5. Com 👁️ desativo = visualização normal

#### Emojis
1. Clique em 😊
2. Escolha o emoji
3. Será adicionado à mensagem

### Gerenciar Conversas

#### Ver Lista
- Esquerda da tela
- Clique para abrir
- 🗑️ para deletar

#### Deletar Conversa
1. Clique no 🗑️ próximo à conversa
2. Confirme a exclusão
3. **Dados são permanentemente apagados** ⚠️

#### Deletar Mensagem
1. Passe o mouse na mensagem
2. Clique em 🗑️
3. Confirme
4. Mensagem é removida

### Sair
- Clique em 🚪 (canto superior)
- Você será desconectado

---

## 🔐 Privacidade & Segurança

### ✅ O que é Protegido

- Sua senha é criptografada no Firebase
- Conexão sempre em HTTPS
- Só você tem acesso à sua conta
- Mensagens deletadas são permanentes
- Fotos são armazenadas com segurança

### ⚠️ O que Você Deve Fazer

1. **Use senha forte** (8+ caracteres, números, símbolos)
2. **Não compartilhe sua senha** com ninguém
3. **Saia em computadores públicos**
4. **Revise a lista de conversas** regularmente

### 🚫 Limitações Intencionais

- ❌ Sem ligação de vídeo/áudio
- ❌ Sem histórico após deletar
- ❌ Sem backup automático
- ❌ Sem recuperação de dados deletados
- ❌ Sem compartilhamento de tela

---

## 🎨 Funcionalidades Detalhadas

### Fotos com Visualização Única

Uma foto é "de visualização única" quando:
- ✅ Você ativa o ícone 👁️
- ✅ Expira automaticamente em 1 hora
- ✅ O destinatário sabe que é efêmera

Sem visualização única:
- ✅ Foto fica permanente
- ✅ Pode ser visualizada múltiplas vezes
- ✅ Persiste na conversa

### Emojis

- Clique em 😊 para abrir seletor
- Escolha o emoji desejado
- Será adicionado à mensagem
- Você pode adicionar múltiplos emojis

### Real-time

- Mensagens aparecem **instantaneamente**
- Sem necessidade de atualizar
- Notificações de nova mensagem (se habilitadas)

---

## 🛠️ Arquitetura Técnica

### Stack Tecnológico

```
Frontend (React + TypeScript)
    ↓
Vite (Build)
    ↓
Firebase SDK
    ↓
Firebase Backend
    ├── Authentication
    ├── Firestore Database
    └── Cloud Storage
```

### Estrutura de Dados

```
Firestore:
├── users/
│   ├── [uid]
│   │   ├── username
│   │   ├── email
│   │   └── createdAt
│
└── chats/
    ├── [chatId]
    │   ├── participants []
    │   ├── participantNames []
    │   ├── lastMessage
    │   ├── lastMessageTime
    │   └── messages/
    │       └── [messageId]
    │           ├── senderId
    │           ├── text
    │           ├── imageUrl
    │           ├── isEphemeral
    │           ├── ephemeralExpiry
    │           └── timestamp
```

### Fluxo de Segurança

```
User Login
    ↓
Firebase Authentication
    ↓
Retrieve User Data
    ↓
Load User's Chats
    ↓
Real-time Listener ← Firestore Rules Check
    ↓
Display Messages (only if authorized)
```

---

## 🚀 Performance

### Otimizações

- ✅ Bundle pequeno (~100KB gzipped)
- ✅ Lazy loading de componentes
- ✅ Real-time subscriptions (não polling)
- ✅ Soft delete (sem exclusão completa)

### Limites (Free Tier Firebase)

- **Firestore**: 1 GB armazenamento
- **Storage**: 5 GB/mês download
- **Usuários simultâneos**: Limitado apenas por conexões

---

## 🐛 FAQ & Troubleshooting

### P: Posso recuperar uma conversa deletada?
**R**: Não. Conversas deletadas são permanentes. Nenhum backup é criado.

### P: Minha foto não aparece?
**R**: 
- Verifique a conexão de internet
- Confirme que é um arquivo de imagem válido
- Verifique permissões do Storage no Firebase

### P: Como sei quando alguém leu minha mensagem?
**R**: Atualmente não há indicador de leitura. Você saberá quando receber uma resposta.

### P: Posso usar em múltiplos dispositivos?
**R**: Sim, mas você será desconectado de um dispositivo se fizer login em outro.

### P: As mensagens são criptografadas?
**R**: Sim, em trânsito (HTTPS). Para criptografia em repouso, ative no Firebase.

### P: Posso exportar minhas conversas?
**R**: Não há funcionalidade built-in, mas você pode fazer screenshot.

### P: Qual é o tamanho máximo de foto?
**R**: Firebase Storage permite até 5GB por arquivo (prático: ~20MB)

### P: Posso deletar apenas uma mensagem?
**R**: Sim, clique em 🗑️ na mensagem. A conversa permanece.

---

## 📞 Suporte

### Bugs e Issues
- Crie uma issue no [GitHub](https://github.com/renanarj/vamove/issues)
- Descreva o problema detalhadamente
- Inclua screenshots se possível

### Sugestões de Funcionalidades
- Abra uma discussão no GitHub
- Descreva o caso de uso
- Explique por que é importante

### Documentação Adicional
- [Firebase Setup](./FIREBASE_SETUP.md) - Configuração do backend
- [Deployment](./DEPLOYMENT.md) - Como publicar
- [README](./README.md) - Visão geral do projeto

---

## 📝 Termos de Uso

### Proibido

- ❌ Usar para atividades ilegais
- ❌ Harasser ou bullying
- ❌ Compartilhar dados de terceiros
- ❌ Violar privacidade de outros

### Permitido

- ✅ Uso pessoal e privado
- ✅ Comunicação com amigos/família
- ✅ Modificar código (MIT License)
- ✅ Deploy em servidor próprio

---

## 📄 Licença

MIT License - Veja LICENSE para detalhes

---

**Desenvolvido com ❤️ por Renato**

**Versão**: 1.0.0  
**Última atualização**: 2026-11-10
