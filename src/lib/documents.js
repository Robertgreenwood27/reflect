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
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

export class DocumentsService {
  constructor() {
    this.collection = collection(db, 'documents');
  }

  // Create a new document
  async createDocument(userId) {
    console.log('Creating document for user:', userId);
    try {
      const docRef = await addDoc(this.collection, {
        ownerId: userId,
        title: 'Untitled Document',
        content: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isShared: false,
        sharedWith: {},
        messages: []
      });
      console.log('Document created with ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Get real-time updates for user's documents
  subscribeToUserDocuments(userId, callback) {
    console.log('Subscribing to documents for user:', userId);
    
    if (!userId) {
      console.warn('No userId provided to subscribeToUserDocuments');
      callback([]);
      return () => {};
    }

    const q = query(
      this.collection,
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('Document snapshot received:', {
          size: snapshot.size,
          empty: snapshot.empty
        });
        
        const documents = [];
        snapshot.forEach((doc) => {
          documents.push({ 
            id: doc.id, 
            ...doc.data(),
            // Convert Firestore Timestamps to regular dates for easier handling
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          });
        });
        
        console.log('Processed documents:', {
          count: documents.length,
          ids: documents.map(d => d.id)
        });
        
        callback(documents);
      },
      (error) => {
        console.error('Error in documents subscription:', error);
        callback([]);
      }
    );

    return unsubscribe;
  }

  // Update document content
  async updateDocument(documentId, content) {
    console.log('Updating document:', documentId);
    try {
      const docRef = doc(this.collection, documentId);
      await updateDoc(docRef, {
        content,
        updatedAt: serverTimestamp()
      });
      console.log('Document updated successfully');
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Update document title
  async updateTitle(documentId, title) {
    console.log('Updating title for document:', documentId);
    try {
      const docRef = doc(this.collection, documentId);
      await updateDoc(docRef, {
        title,
        updatedAt: serverTimestamp()
      });
      console.log('Title updated successfully');
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  }

  // Share document with other users
  async shareDocument(documentId, userEmail) {
    console.log('Sharing document:', documentId, 'with user:', userEmail);
    try {
      const docRef = doc(this.collection, documentId);
      await updateDoc(docRef, {
        isShared: true,
        [`sharedWith.${userEmail}`]: {
          accessLevel: 'editor',
          joinedAt: serverTimestamp()
        }
      });
      console.log('Document shared successfully');
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }

  // Add message to shared document
  async addMessage(documentId, userId, content) {
    console.log('Adding message to document:', documentId);
    try {
      const docRef = doc(this.collection, documentId);
      await updateDoc(docRef, {
        messages: arrayUnion({
          content,
          senderId: userId,
          timestamp: serverTimestamp()
        })
      });
      console.log('Message added successfully');
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(documentId) {
    console.log('Deleting document:', documentId);
    try {
      const docRef = doc(this.collection, documentId);
      await deleteDoc(docRef);
      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

export const documentsService = new DocumentsService();
