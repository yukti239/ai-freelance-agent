import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firebase connection successful');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("❌ Firebase connection failed - check your internet connection");
      } else if (error.message.includes('permission-denied')) {
        console.log('ℹ️  Firebase connected but test document access denied (expected)');
      } else {
        console.log('ℹ️  Firebase connection test completed');
      }
    }
  }
}

testConnection();
