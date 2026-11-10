import './style.css';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const root = document.querySelector('#app');
if (Object.values(config).some((value) => !value)) {
  root.innerHTML = '<main class="setup"><h1>Configuração necessária</h1><p>Configure o Firebase conforme as instruções do README.</p></main>';
} else {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app);
  const call = (name, data) => httpsCallable(functions, name)(data);
  let user, people = [], chats = [], selected = null, unsubscribers = [], unsubscribeMessages, viewerUrl;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (text, className, action) => {
    const node = el('button', className, text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  };
  const notify = (error) => {
    console.error(error);
    const toast = document.querySelector('#notice');
    if (toast) {
      toast.textContent = error?.message || 'Algo deu errado. Tente novamente.';
      toast.hidden = false;
    }
  };
  const cleanup = () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    unsubscribers = [];
    unsubscribeMessages?.();
    unsubscribeMessages = null;
    if (viewerUrl) URL.revokeObjectURL(viewerUrl);
    viewerUrl = null;
    selected = null;
    people = [];
    chats = [];
  };

  function login() {
    root.innerHTML = `<main class="login"><div class="login-card">
      <div class="brand-mark">✦</div><span class="eyebrow">UM ESPAÇO MAIS RESERVADO</span>
      <h1>Conversas que<br>ficam entre vocês.</h1>
      <p>Um lugar simples e discreto para manter contato com quem importa.</p>
      <form id="login-form"><label>E-mail<input name="email" type="email" autocomplete="username" required></label>
      <label>Senha<input name="password" type="password" autocomplete="current-password" required></label>
      <button class="primary" type="submit">Entrar na conversa <span>→</span></button></form>
      <p id="notice" class="notice" role="alert" hidden></p>
      <div class="login-foot">🔒 Acesso somente para contas autorizadas</div></div></main>`;
    root.querySelector('form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = form.querySelector('button');
      submit.disabled = true;
      try { await signInWithEmailAndPassword(auth, form.email.value, form.password.value); }
      catch { notify(new Error('Não foi possível entrar. Confira seu e-mail e senha.')); }
      finally { submit.disabled = false; }
    });
  }

  function nameOf(uid) {
    return people.find((person) => person.id === uid)?.name || 'Usuário';
  }
  function sidebar() {
    const list = root.querySelector('#chat-list');
    if (!list) return;
    list.replaceChildren();
    if (!chats.length) list.append(el('p', 'empty-list', 'Nenhuma conversa ainda. Escolha um contato abaixo.'));
    chats.forEach((chat) => {
      const other = chat.members.find((id) => id !== user.uid);
      const item = button('', `chat-item ${selected === chat.id ? 'selected' : ''}`, () => selectChat(chat.id));
      item.append(el('span', 'avatar', nameOf(other).slice(0, 1).toUpperCase()), el('span', 'chat-name', nameOf(other)));
      item.append(el('span', 'chat-arrow', '›'));
      list.append(item);
    });
    const contacts = root.querySelector('#contacts');
    contacts.replaceChildren();
    people.filter((person) => person.id !== user.uid && person.enabled).forEach((person) => {
      const item = button('', 'contact', async () => {
        try {
          const result = await call('startChat', { uid: person.id });
          selectChat(result.data.id);
        } catch (error) { notify(error); }
      });
      item.append(el('span', 'contact-dot'), el('span', '', person.name), el('span', 'contact-plus', '+'));
      contacts.append(item);
    });
    if (!contacts.children.length) contacts.append(el('p', 'empty-list', 'Nenhum outro contato disponível.'));
  }

  function selectChat(id) {
    selected = id;
    sidebar();
    unsubscribeMessages?.();
    unsubscribeMessages = null;
    const chat = chats.find((item) => item.id === id);
    const panel = root.querySelector('#conversation');
    if (!chat) {
      panel.innerHTML = '<div class="welcome"><div class="welcome-icon">✦</div><h2>Uma conversa de cada vez.</h2><p>Selecione uma conversa ou escolha um contato para começar.</p><span>🔒 Seu espaço reservado</span></div>';
      return;
    }
    const other = chat.members.find((member) => member !== user.uid);
    panel.innerHTML = `<header class="conversation-header"><div id="chat-title"></div><button id="delete-chat" class="delete-button" type="button">Excluir conversa</button></header>
      <div id="messages" class="messages"></div><form id="composer" class="composer">
      <button type="button" id="emoji-toggle" class="icon-button" aria-label="Emojis">☺</button>
      <div id="emoji-picker" class="emoji-picker" hidden></div>
      <label class="icon-button attachment" title="Enviar imagem">＋<input id="image" type="file" accept="image/jpeg,image/png,image/webp" hidden></label>
      <input id="message-input" maxlength="4000" placeholder="Escreva uma mensagem..." autocomplete="off">
      <button class="send-button" type="submit" aria-label="Enviar mensagem">➤</button></form>`;
    const title = panel.querySelector('#chat-title');
    title.append(el('span', 'avatar', nameOf(other).slice(0, 1).toUpperCase()));
    const titleText = el('div', 'title-text');
    titleText.append(el('strong', '', nameOf(other)), el('small', '', chat.state === 'deleting' ? 'Exclusão pendente' : 'Conversa privada'));
    title.append(titleText);
    panel.querySelector('#delete-chat').addEventListener('click', async () => {
      if (!confirm('Excluir esta conversa para todos? As mensagens e imagens serão apagadas.')) return;
      try {
        await call('deleteChat', { chatId: id });
        if (selected === id) { selected = null; sidebar(); selectChat(null); }
      } catch (error) { notify(error); }
    });
    const form = panel.querySelector('#composer');
    if (chat.state !== 'active') {
      form.remove();
      panel.querySelector('#messages').append(el('p', 'empty-list', 'A exclusão não foi concluída. Use “Excluir conversa” para tentar novamente.'));
      return;
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.querySelector('#message-input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      try { await call('sendMessage', { chatId: id, text }); }
      catch (error) { input.value = text; notify(error); }
    });
    const picker = panel.querySelector('#emoji-picker');
    ['😀', '😂', '🥰', '😍', '😊', '😉', '😢', '❤️', '👍', '🙏', '✨', '🎉'].forEach((emoji) => {
      picker.append(button(emoji, '', () => {
        const input = form.querySelector('#message-input');
        input.setRangeText(emoji, input.selectionStart, input.selectionEnd, 'end');
        input.focus();
        picker.hidden = true;
      }));
    });
    panel.querySelector('#emoji-toggle').addEventListener('click', () => { picker.hidden = !picker.hidden; });
    panel.querySelector('#image').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        notify(new Error('Escolha uma imagem JPEG, PNG ou WebP de até 5 MB.'));
        return;
      }
      const once = confirm('Enviar como visualização única? Escolha Cancelar para enviar uma imagem normal.');
      try {
        const image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await call('sendMessage', { chatId: id, image, once });
      } catch (error) { notify(error); }
    });
    unsubscribeMessages = onSnapshot(query(collection(db, 'chats', id, 'messages'), orderBy('createdAt')), (snapshot) => {
      const list = panel.querySelector('#messages');
      list.replaceChildren();
      if (snapshot.empty) list.append(el('p', 'start-hint', 'Comece uma conversa. As mensagens aparecem aqui.'));
      snapshot.forEach((message) => renderMessage(list, id, message));
      list.scrollTop = list.scrollHeight;
    }, (error) => {
      if (selected === id && chats.find((item) => item.id === id)?.state === 'active') notify(error);
    });
  }

  function renderMessage(list, chatId, snapshot) {
    const message = snapshot.data();
    const mine = message.sender === user.uid;
    const bubble = el('div', `bubble ${mine ? 'mine' : ''}`);
    if (message.kind === 'text') {
      bubble.append(el('div', 'message-text', message.text));
    } else if (message.kind === 'image') {
      const label = message.once ? (message.viewed ? '◉ Imagem visualizada' : '◉ Imagem de visualização única') : '▧ Abrir imagem';
      const open = button(label, 'image-button', async () => {
        open.disabled = true;
        try {
          const result = await call('openImage', { chatId, messageId: snapshot.id });
          const bytes = Uint8Array.from(atob(result.data.image), (char) => char.charCodeAt(0));
          viewerUrl = URL.createObjectURL(new Blob([bytes], { type: result.data.contentType }));
          const dialog = el('dialog', 'viewer');
          const image = el('img');
          image.src = viewerUrl;
          image.alt = 'Imagem enviada na conversa';
          dialog.append(button('Fechar ×', 'viewer-close', () => dialog.close()), image);
          dialog.addEventListener('close', () => { URL.revokeObjectURL(viewerUrl); viewerUrl = null; dialog.remove(); });
          document.body.append(dialog);
          dialog.showModal();
        } catch (error) { notify(error); }
        finally { open.disabled = false; }
      });
      open.disabled = message.once && (mine || message.viewed);
      bubble.append(open);
    }
    if (message.createdAt) bubble.append(el('time', '', message.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })));
    list.append(bubble);
  }

  function workspace() {
    root.innerHTML = `<main class="app-shell"><aside class="sidebar"><header class="sidebar-header">
      <div class="logo"><span class="logo-mark">✦</span><div><strong>vamove</strong><small>conversas privadas</small></div></div>
      <button id="logout" class="logout" title="Sair">Sair ↗</button></header>
      <div class="sidebar-content"><div class="section-title"><h1>Conversas</h1><span>✦</span></div>
      <p class="sidebar-subtitle">Boas conversas começam aqui.</p><div id="chat-list"></div>
      <div class="contacts-heading"><span>SEUS CONTATOS</span><span>＋</span></div><div id="contacts"></div></div>
      <footer class="sidebar-footer"><span class="avatar" id="my-avatar"></span><div><strong id="my-name"></strong><small>Conta autorizada</small></div><span class="online-dot"></span></footer></aside>
      <section id="conversation" class="conversation"></section><p id="notice" class="notice floating" role="alert" hidden></p></main>`;
    root.querySelector('#logout').addEventListener('click', () => signOut(auth));
    const myName = nameOf(user.uid);
    root.querySelector('#my-name').textContent = myName;
    root.querySelector('#my-avatar').textContent = myName.slice(0, 1).toUpperCase();
    sidebar();
    selectChat(null);
    unsubscribers.push(onSnapshot(collection(db, 'users'), (snapshot) => {
      people = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const me = people.find((person) => person.id === user.uid);
      if (!me?.enabled) { signOut(auth); return; }
      root.querySelector('#my-name').textContent = me.name;
      root.querySelector('#my-avatar').textContent = me.name.slice(0, 1).toUpperCase();
      sidebar();
    }, notify));
    unsubscribers.push(onSnapshot(query(collection(db, 'chats'), where('members', 'array-contains', user.uid)), (snapshot) => {
      chats = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      sidebar();
      if (selected) selectChat(chats.some((chat) => chat.id === selected) ? selected : null);
    }, notify));
  }

  onAuthStateChanged(auth, async (current) => {
    cleanup();
    if (!current) { user = null; login(); return; }
    user = current;
    try {
      const profile = await getDoc(doc(db, 'users', user.uid));
      if (!profile.exists() || !profile.data().enabled) throw new Error('Conta não autorizada.');
      people = [{ id: user.uid, ...profile.data() }];
      workspace();
    } catch {
      await signOut(auth);
      notify(new Error('Esta conta não está autorizada a acessar o aplicativo.'));
    }
  });
}
