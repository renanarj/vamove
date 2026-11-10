import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { randomUUID } from 'node:crypto';
import { conversationId, decodeImage, validText } from './validation.js';

initializeApp();
const db = getFirestore();
const bucket = () => getStorage().bucket();

async function active(uid) {
  if (!uid) throw new HttpsError('unauthenticated', 'Entre na sua conta.');
  const user = await db.doc(`users/${uid}`).get();
  if (!user.exists || user.data().enabled !== true) throw new HttpsError('permission-denied', 'Conta sem acesso.');
}

function chatRef(id) {
  if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) throw new HttpsError('invalid-argument', 'Conversa inválida.');
  return db.doc(`chats/${id}`);
}

function requireMember(snapshot, uid, allowDeleting = false) {
  const chat = snapshot.data();
  if (!chat || !Array.isArray(chat.members) || !chat.members.includes(uid) ||
      (chat.state !== 'active' && !(allowDeleting && chat.state === 'deleting'))) {
    throw new HttpsError('permission-denied', 'Conversa indisponível.');
  }
}

export const startChat = onCall(async (request) => {
  const uid = request.auth?.uid;
  await active(uid);
  const other = request.data?.uid;
  if (typeof other !== 'string' || !other || other === uid || other.includes('/')) throw new HttpsError('invalid-argument', 'Contato inválido.');
  await active(other);
  const ref = chatRef(conversationId(uid, other));
  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (snapshot.exists) {
      requireMember(snapshot, uid);
    } else {
      tx.create(ref, { members: [uid, other], state: 'active', createdAt: FieldValue.serverTimestamp() });
    }
  });
  return { id: ref.id };
});

export const sendMessage = onCall(async (request) => {
  const uid = request.auth?.uid;
  await active(uid);
  const ref = chatRef(request.data?.chatId);
  const text = request.data?.text;
  const image = request.data?.image;
  if (!image && !validText(text)) throw new HttpsError('invalid-argument', 'Escreva uma mensagem de até 4000 caracteres.');
  if (image && text) throw new HttpsError('invalid-argument', 'Envie texto ou imagem separadamente.');
  let uploaded;
  const message = ref.collection('messages').doc();
  let data;
  if (image) {
    let decoded;
    try { decoded = decodeImage(image); } catch (error) { throw new HttpsError('invalid-argument', error.message); }
    const snapshot = await ref.get();
    requireMember(snapshot, uid);
    uploaded = bucket().file(`chats/${ref.id}/${message.id}`);
    await uploaded.save(decoded.bytes, { contentType: decoded.type, resumable: false });
    data = { kind: 'image', path: uploaded.name, contentType: decoded.type, once: request.data?.once === true, viewed: false };
  } else {
    data = { kind: 'text', text: text.trim() };
  }
  try {
    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      requireMember(snapshot, uid);
      tx.create(message, { ...data, sender: uid, createdAt: FieldValue.serverTimestamp() });
    });
  } catch (error) {
    if (uploaded) await uploaded.delete({ ignoreNotFound: true });
    throw error;
  }
  return { ok: true };
});

export const openImage = onCall(async (request) => {
  const uid = request.auth?.uid;
  await active(uid);
  const ref = chatRef(request.data?.chatId);
  const id = request.data?.messageId;
  if (typeof id !== 'string' || !/^[A-Za-z0-9]{20}$/.test(id)) throw new HttpsError('invalid-argument', 'Mensagem inválida.');
  const message = ref.collection('messages').doc(id);
  const data = await db.runTransaction(async (tx) => {
    const chat = await tx.get(ref);
    const snapshot = await tx.get(message);
    requireMember(chat, uid);
    const item = snapshot.data();
    if (!item || item.kind !== 'image' || (item.once && (item.sender === uid || item.viewed))) {
      throw new HttpsError('permission-denied', 'Imagem indisponível.');
    }
    if (item.once) tx.update(message, { viewed: true });
    return item;
  });
  const file = bucket().file(data.path);
  try {
    const [bytes] = await file.download();
    return { image: bytes.toString('base64'), contentType: data.contentType };
  } finally {
    if (data.once) await file.delete({ ignoreNotFound: true });
  }
});

export const deleteChat = onCall({ timeoutSeconds: 540 }, async (request) => {
  const uid = request.auth?.uid;
  await active(uid);
  const ref = chatRef(request.data?.chatId);
  const lease = randomUUID();
  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    requireMember(snapshot, uid, true);
    if (snapshot.data().leaseUntil > Date.now()) {
      throw new HttpsError('aborted', 'A exclusão já está em andamento. Tente novamente mais tarde.');
    }
    tx.update(ref, { state: 'deleting', lease, leaseUntil: Date.now() + 600_000 });
  });
  try {
    await bucket().deleteFiles({ prefix: `chats/${ref.id}/`, force: true });
    await db.recursiveDelete(ref);
  } catch (error) {
    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists && snapshot.data().lease === lease) tx.update(ref, { leaseUntil: 0 });
    });
    throw error;
  }
  return { ok: true };
});
