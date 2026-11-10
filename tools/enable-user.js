import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const [uid, ...parts] = process.argv.slice(2);
const name = parts.join(' ').trim();
if (!uid || uid.includes('/') || !name || name.length > 80) {
  console.error('Uso: node tools/enable-user.js UID "Nome de usuário"');
  process.exit(1);
}
initializeApp({ credential: applicationDefault() });
const user = await getAuth().getUser(uid);
if (user.disabled || !user.email) throw new Error('A conta deve estar ativa e ter um e-mail.');
await getFirestore().doc(`users/${uid}`).set({ name, enabled: true });
console.log(`Acesso habilitado para ${name}.`);
