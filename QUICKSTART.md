# 🚀 VaMove Chat - Início Rápido

## ⚡ 5 Minutos para Começar

### 1️⃣ Clonar Repositório
```bash
git clone https://github.com/renanarj/vamove.git
cd vamove
```

### 2️⃣ Instalar Dependências
```bash
npm install
```

### 3️⃣ Configurar Firebase
- Acesse https://console.firebase.google.com
- Crie um novo projeto
- Habilite **Authentication > Email/Senha**
- Crie **Firestore Database**
- Crie **Storage**
- Copie credenciais (detalhes em [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

### 4️⃣ Criar `.env.local`
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais Firebase
```

### 5️⃣ Rodar Localmente
```bash
npm run dev
# Acesse http://localhost:3000
```

---

## 📋 Checklist de Configuração Firebase

Depois de criar o projeto Firebase, não esqueça de:

- [ ] **Firestore Security Rules** (copie de [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
- [ ] **Storage Rules** (copie de [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
- [ ] **Variáveis de Ambiente** preenchidas em `.env.local`
- [ ] **Teste o app** em http://localhost:3000

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [README.md](./README.md) | Visão geral, features e tecnologias |
| [GUIDE.md](./GUIDE.md) | Como usar o aplicativo (usuário final) |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Configuração passo-a-passo do Firebase |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Como publicar (Firebase, Vercel, etc) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Guia para desenvolvedores |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de versões |

---

## 🎯 Próximos Passos

1. **Configurar Firebase** → Siga [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. **Testar Localmente** → `npm run dev`
3. **Usar o App** → Leia [GUIDE.md](./GUIDE.md)
4. **Publicar** → Siga [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Desenvolver** → Veja [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## ✨ Features

- 🔐 Autenticação segura (email + username)
- 💬 Chat em tempo real
- 📸 Fotos com visualização única
- 😊 Suporte a emojis
- 🗑️ Exclusão permanente
- 📱 Responsivo (desktop, tablet, mobile)
- 🚀 Rápido com Vite + React

---

## 🆘 Problemas Comuns

### "Firebase não conecta"
- ✓ Verifique se `.env.local` tem credenciais corretas
- ✓ Confirme projeto Firebase está ativo
- ✓ Revise regras de segurança

### "Build falhou"
```bash
rm -rf node_modules dist
npm install
npm run build
```

### "Porta 3000 ocupada"
```bash
npm run dev -- --port 3001
```

Mais troubleshooting em [GUIDE.md](./GUIDE.md#troubleshooting)

---

## 📞 Suporte

- 📖 Leia a documentação
- 🐛 Abra uma issue no GitHub
- 💬 Crie uma discussão

---

## 📄 Licença

MIT - Livre para usar e modificar

---

**Desenvolvido com ❤️ - Pronto para usar!**
