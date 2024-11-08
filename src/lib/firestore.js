// src/lib/firestore.js
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

export async function createDocument(userId, title = 'Untitled') {
  try {
    const docRef = await addDoc(collection(db, 'documents'), {
      title,
      owner: userId,
      sharedWith: [],
      lastModified: Date.now(),
      content: [],
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function deleteDocument(docId) {
  try {
    await deleteDoc(doc(db, 'documents', docId));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export async function getUserDocuments(userId) {
  try {
    const q = query(
      collection(db, 'documents'),
      where('owner', '==', userId),
      orderBy('lastModified', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

export async function getDocument(docId) {
  try {
    const docRef = doc(db, 'documents', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

export async function updateDocumentTitle(docId, newTitle) {
  try {
    await updateDoc(doc(db, 'documents', docId), {
      title: newTitle,
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Error updating document title:', error);
    throw error;
  }
}

export async function updateDocument(docId, data) {
  try {
    const docRef = doc(db, 'documents', docId);
    await updateDoc(docRef, {
      ...data,
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function saveDocumentContent(docId, content) {
  try {
    const docRef = doc(db, 'documents', docId);
    await updateDoc(docRef, {
      content,
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Error saving document content:', error);
    throw error;
  }
}