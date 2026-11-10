# 🚀 Guia de Deployment - VaMove Chat

## Opções de Deployment

### 1️⃣ Firebase Hosting (Recomendado ⭐)

Firebase Hosting é a opção mais integrada e recomendada.

#### Pré-requisitos
- Projeto Firebase criado
- Firebase CLI instalado: `npm install -g firebase-tools`
- Conta Google

#### Passos

1. **Instale o Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Faça login no Firebase**
   ```bash
   firebase login
   ```

3. **Inicialize Firebase no projeto**
   ```bash
   firebase init hosting
   ```
   - Selecione seu projeto
   - Digite `dist` como pasta de build
   - Digite `N` para rewrite
   - Digite `N` para overwrite

4. **Build a aplicação**
   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy
   ```

6. **URL do seu site**
   - Será mostrada após o deploy
   - Ex: `https://seu-projeto.web.app`

#### Atualizações futuras
```bash
npm run build && firebase deploy
```

---

### 2️⃣ Vercel

Vercel é uma ótima opção com deployment automático.

#### Passos

1. **Crie uma conta em [Vercel](https://vercel.com)**

2. **Instale Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure variáveis de ambiente**
   - Vercel Dashboard > Project > Settings > Environment Variables
   - Adicione:
     ```
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     (etc)
     ```

5. **Reconecte com Git**
   - Deploy automático em cada push

---

### 3️⃣ Netlify

Alternativa fácil com suporte a Functions.

#### Passos

1. **Crie uma conta em [Netlify](https://netlify.com)**

2. **Conecte seu repositório Git**
   - Clique em "New site from Git"
   - Selecione seu repositório

3. **Configure build**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Configure variáveis de ambiente**
   - Site settings > Build & deploy > Environment
   - Adicione suas variáveis Firebase

5. **Deploy automático**
   - Cada push para main dispara build

---

### 4️⃣ AWS Amplify

Para quem já usa AWS.

#### Passos

1. **Crie uma conta em [AWS Amplify](https://aws.amazon.com/amplify)**

2. **Conecte seu repositório**

3. **Configure build**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Configure variáveis de ambiente**

5. **Deploy e CI/CD automático**

---

### 5️⃣ Railway / Render

Opções alternativas simples.

#### Railway
```bash
# Crie conta em railway.app
# Conecte seu repositório
# Configure ambiente
# Deploy automático
```

#### Render
```bash
# Crie conta em render.com
# Conecte seu repositório
# Configure como Static Site
# Deploy automático
```

---

## 🔐 Checklist de Segurança antes de Deploy

- [ ] Variáveis de ambiente configuradas (nunca commitadas)
- [ ] Firestore com regras de segurança ativas
- [ ] Storage com regras de segurança ativas
- [ ] HTTPS habilitado (padrão em todas as plataformas)
- [ ] Autenticação Firebase ativa
- [ ] Soft delete implementado
- [ ] .env.local no .gitignore
- [ ] URL de production configurada no Firebase (se necessário)

## 📊 Monitoramento após Deploy

### Firebase Console
- Realtime Database > Data > Monitor conexões
- Firestore > Usage > Visualizar estatísticas
- Storage > Files > Monitorar espaço

### Plataforma de Hosting
- Analytics de visitas
- Error tracking
- Performance monitoring

## 🎯 Performance

### Otimizações implementadas
- ✅ Code splitting com Vite
- ✅ Lazy loading de componentes
- ✅ Real-time updates (apenas dados necessários)
- ✅ Compressão de imagens recomendada

### Para melhorar mais
```bash
# Analisar bundle
npm run build -- --analyze

# Usar service worker (PWA)
npm install workbox-webpack-plugin
```

## 🚨 Troubleshooting de Deploy

### "Erro de variáveis de ambiente"
- Verifique se todas as variáveis estão configuradas
- Reconstrua após adicionar variáveis

### "Firestore Access Denied"
- Verifique regras de segurança
- Revise permissões do usuário

### "Blank page após deploy"
- Verifique console do navegador
- Confirme que Firebase está inicializado
- Verifique CORS (deve estar ok)

### "Fotos não carregam"
- Verifique Storage rules
- Confirme que arquivos foram enviados
- Revise limites de cota

## 💰 Estimativa de Custos

### Firebase
- **Free tier**: Suficiente para testes
- **Production**: ~$0-50/mês (conforme uso)

### Hosting (Firebase)
- **Free**: 1 site, 1 GB storage
- **Pago**: $0.50/GB acima

### Storage
- **Free**: 5 GB/mês
- **Pago**: $0.18/GB

---

**Recomendação**: Comece com Firebase Hosting + Free tier do Firebase. Escale conforme necessário.
