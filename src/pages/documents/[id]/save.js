// pages/api/documents/[id]/save.js
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { id } = req.query;
  const data = JSON.parse(req.body);

  try {
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, data);
    res.status(200).end();
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).end();
  }
}