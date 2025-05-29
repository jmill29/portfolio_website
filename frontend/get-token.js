import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, process.env.FIREBASE_USER, process.env.FIREBASE_PASSWORD)
  .then(async (userCredential) => {
    const token = await userCredential.user.getIdToken();
    console.log('ID Token:', token);
  })
  .catch((error) => {
    console.error('Login failed:', error.message);
  })