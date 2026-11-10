# 🛠️ Guia de Desenvolvimento

## Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Git
- Editor de código (VS Code recomendado)

### Setup Inicial

1. **Clone o repositório**
   ```bash
   git clone https://github.com/renanarj/vamove.git
   cd vamove
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase** (veja [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

4. **Crie `.env.local`** com suas credenciais

5. **Inicie o dev server**
   ```bash
   npm run dev
   ```

6. **Abra em seu navegador**
   ```
   http://localhost:3000
   ```

---

## Estrutura de Pastas

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── Auth.tsx         # Tela de autenticação
│   ├── ChatList.tsx     # Lista de conversas
│   ├── MessageList.tsx  # Display de mensagens
│   ├── MessageInput.tsx # Input e envio de mensagens
│   ├── NewChatModal.tsx # Modal para novo chat
│   └── *.css            # Estilos dos componentes
│
├── services/            # Lógica de negócio
│   ├── authService.ts   # Funções de autenticação
│   └── chatService.ts   # Operações de chat
│
├── config/              # Configurações
│   └── firebase.ts      # Inicialização do Firebase
│
├── types/               # TypeScript types e interfaces
│   └── index.ts         # Definições de tipos
│
├── App.tsx              # Componente raiz
├── main.tsx             # Entry point
└── vite-env.d.ts        # Tipos do Vite
```

---

## Fluxo de Desenvolvimento

### 1. Criar um novo componente

```typescript
// src/components/MyComponent.tsx
import './MyComponent.css';

interface MyComponentProps {
  // Suas props
}

export const MyComponent: React.FC<MyComponentProps> = ({ /* props */ }) => {
  return (
    <div className="my-component">
      {/* Seu JSX */}
    </div>
  );
};
```

### 2. Adicionar estilos

```css
/* src/components/MyComponent.css */
.my-component {
  /* Seus estilos */
}
```

### 3. Usar em outro componente

```typescript
import { MyComponent } from './components/MyComponent';

// No JSX
<MyComponent />
```

---

## Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `ChatList.tsx`)
- **Funções/Services**: camelCase (ex: `authService.ts`)
- **Arquivos CSS**: mesmo nome do componente (ex: `ChatList.css`)
- **Classes CSS**: kebab-case (ex: `.chat-list`)
- **Variáveis**: camelCase

### Imports
- Agrupe imports por tipo (React, Firebase, locais)
- Use imports absolutos quando possível
- Adicione type annotations onde necessário

```typescript
import { useState, useEffect } from 'react';
import { getDoc } from 'firebase/firestore';
import { Message } from '../types';
import { chatService } from '../services/chatService';
import './MyComponent.css';
```

### Componentes Funcionais
- Use apenas componentes funcionais com hooks
- Use `React.FC<Props>` para tipagem de componentes

```typescript
interface MessageProps {
  text: string;
  timestamp: Date;
}

export const Message: React.FC<MessageProps> = ({ text, timestamp }) => {
  return <div>{text}</div>;
};
```

---

## Adicionando Funcionalidades

### Adicionar Novo Serviço

1. Crie em `src/services/novoService.ts`
2. Exporte funções úteis
3. Use em componentes via import

```typescript
// src/services/novoService.ts
export const novoService = {
  funcao1: async () => { /* ... */ },
  funcao2: (param: string) => { /* ... */ },
};
```

### Adicionar Nova Página/Tela

1. Crie o componente em `src/components`
2. Importe em `App.tsx`
3. Adicione rota se necessário (não implementado ainda)

### Adicionar Tipos

1. Adicione interface em `src/types/index.ts`
2. Exporte e use em todo o projeto

```typescript
export interface MinhaInterface {
  campo1: string;
  campo2: number;
  campo3?: boolean; // Opcional
}
```

---

## Hot Module Replacement (HMR)

Vite possui HMR automático. Mudanças no código são refletidas no navegador sem refresh.

Se não funcionar:
```bash
# Reinicie o dev server
npm run dev
```

---

## Debugging

### Console
```typescript
console.log('Debug:', variavel);
console.error('Erro:', erro);
```

### DevTools
1. Abra Dev Tools: `F12`
2. Vá para **Sources**
3. Acesse seus arquivos TypeScript

### Firebase Console
Monitore em tempo real:
- Firestore: Collections, Documents, Queries
- Authentication: Usuários
- Storage: Arquivos

---

## Testando Localmente

### Teste de Auth
1. Clique em "Registre-se"
2. Digite dados válidos
3. Deve criar usuário no Firebase

### Teste de Chat
1. Abra em duas abas (usuários diferentes)
2. Crie um chat
3. Envie mensagens
4. Devem aparecer em tempo real

### Teste de Fotos
1. Clique em 📷
2. Selecione imagem
3. Com/sem visualização única
4. Deve enviar para Firebase Storage

---

## Ferramentas Úteis

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Vue Plugin
- Prettier - Code formatter
- Firebase Explorer
- Thunder Client (para testes de API)

### Comandos npm

```bash
# Dev
npm run dev

# Build
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

### Chrome DevTools
- **Network**: Monitore requisições Firebase
- **Console**: Veja logs e erros
- **Storage**: Veja dados locais/cookies
- **React DevTools**: Inspecione componentes

---

## Performance

### Otimizações já implementadas
- ✅ Code splitting do Vite
- ✅ Lazy loading de componentes
- ✅ Firebase listeners (não polling)
- ✅ CSS minificado

### Como melhorar ainda mais
1. Implementar Virtual Scrolling para grandes listas
2. Memoizar componentes com `React.memo`
3. Usar `useCallback` para funções
4. Lazy load de imagens
5. Service Worker (PWA)

---

## Segurança

### Nunca fazer
- ❌ Committar `.env.local`
- ❌ Usar credenciais fake em produção
- ❌ Guardar senhas em localStorage
- ❌ Fazer requisições sem HTTPS
- ❌ Expor API keys no frontend (Firebase SDK já cuida disso)

### Fazer sempre
- ✅ Revisar Firestore Rules
- ✅ Validar inputs no frontend
- ✅ Usar HTTPS em produção
- ✅ Manter Firebase SDK atualizado

---

## Troubleshooting

### "Cannot find module..."
- Verifique o caminho do import
- Confirme que o arquivo existe
- Limpe `node_modules` e reinstale

### "Port 3000 já está em uso"
```bash
npm run dev -- --port 3001
```

### "Build falhou"
```bash
# Limpe cache
rm -rf dist node_modules
npm install
npm run build
```

### Firebase não conecta
- Verifique `.env.local`
- Confirme credenciais no Firebase Console
- Verifique se o projeto está ativo

---

## Contribuindo

1. **Fork** o repositório
2. **Crie uma branch**: `git checkout -b feature/minha-feature`
3. **Commit**: `git commit -m "Adiciona minha feature"`
4. **Push**: `git push origin feature/minha-feature`
5. **Abra um Pull Request**

---

## Recursos

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Happy coding! 🚀**
