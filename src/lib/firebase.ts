// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔥 [FIREBASE CONFIG] Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? 'SET' : 'NOT_SET',
  authDomain: firebaseConfig.authDomain ? 'SET' : 'NOT_SET',
  projectId: firebaseConfig.projectId ? 'SET' : 'NOT_SET',
  storageBucket: firebaseConfig.storageBucket ? 'SET' : 'NOT_SET',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'SET' : 'NOT_SET',
  appId: firebaseConfig.appId ? 'SET' : 'NOT_SET'
});

console.log('🔥 [FIREBASE CONFIG] Project ID:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('🔥 [FIREBASE CONFIG] Firebase app initialized successfully');

// Initialize Firestore
export const db = getFirestore(app);
console.log('🔥 [FIREBASE CONFIG] Firestore initialized successfully');

export default app;
