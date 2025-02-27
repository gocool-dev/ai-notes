import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlYQEmzrrIiXOKpLeeWqMjCh221Jx11AY",
  authDomain: "ai-notes-77cda.firebaseapp.com",
  projectId: "ai-notes-77cda",
  storageBucket: "ai-notes-77cda.firebasestorage.app",
  messagingSenderId: "71921537356",
  appId: "1:71921537356:web:4a55d7770fcbc551643fe9",
  measurementId: "G-CW2CZ4PLZ7"
};

let app;
let auth;
let db;
let storage;
let functions;
let messaging;

export function initializeFirebase() {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase Auth with AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    
    // Initialize Firestore
    db = getFirestore(app);
    
    // Initialize Storage
    storage = getStorage(app);
    
    // Initialize Functions
    functions = getFunctions(app);
    
    // Initialize Messaging if supported
    isSupported().then(isSupported => {
      if (isSupported) {
        messaging = getMessaging(app);
      }
    });
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export { app, auth, db, storage, functions, messaging };