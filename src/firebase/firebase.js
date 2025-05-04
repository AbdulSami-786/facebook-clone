// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; // ✅ You forgot this import

const firebaseConfig = {
  apiKey: "AIzaSyApb64ajVgexe6j3P-e_sYXinPney0Xwe4",
  authDomain: "facebook-befac.firebaseapp.com",
  projectId: "facebook-befac",
  storageBucket: "facebook-befac.appspot.com", // ✅ Typo fixed
  messagingSenderId: "921175537524",
  appId: "1:921175537524:web:53c334cbc9f56a9db2de21"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export initialized services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
