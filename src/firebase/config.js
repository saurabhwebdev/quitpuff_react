import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBo-xkgBPWRBxbrSMoYd222N-lGZlMATsc",
  authDomain: "indiecrm.firebaseapp.com",
  projectId: "indiecrm",
  storageBucket: "indiecrm.firebasestorage.app",
  messagingSenderId: "397868254447",
  appId: "1:397868254447:web:3d01ac040227a2b2fd071a",
  measurementId: "G-GMZWNXTGCT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 