import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

export class DocumentsService {
  constructor() {
    this.collection = collection(db, 'documents');
  }

  // Create a new document
  async createDocument(userId) {
    return await addDoc(this.collection, {
      ownerId: userId,
      title: 'Untitled Document',
      content: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isShared: false,
      sharedWith: {},
      messages: []
    });
  }

  // Get real-time updates for user's documents
  subscribeToUserDocuments(userId, callback) {
    const q = query(
      this.collection,
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    });
  }

  // Update document content
  async updateDocument(documentId, content) {
    const docRef = doc(this.collection, documentId);
    await updateDoc(docRef, {
      content,
      updatedAt: serverTimestamp()
    });
  }

  // Update document title
  async updateTitle(documentId, title) {
    const docRef = doc(this.collection, documentId);
    await updateDoc(docRef, {
      title,
      updatedAt: serverTimestamp()
    });
  }

  // Share document with other users
  async shareDocument(documentId, userEmail) {
    const docRef = doc(this.collection, documentId);
    await updateDoc(docRef, {
      isShared: true,
      [`sharedWith.${userEmail}`]: {
        accessLevel: 'editor',
        joinedAt: serverTimestamp()
      }
    });
  }

  // Add message to shared document
  async addMessage(documentId, userId, content) {
    const docRef = doc(this.collection, documentId);
    await updateDoc(docRef, {
      messages: arrayUnion({
        content,
        senderId: userId,
        timestamp: serverTimestamp()
      })
    });
  }

  // Delete document
  async deleteDocument(documentId) {
    const docRef = doc(this.collection, documentId);
    await deleteDoc(docRef);
  }
}

export const documentsService = new DocumentsService();