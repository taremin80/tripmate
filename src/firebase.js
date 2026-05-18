import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCr89MPI1cNbU7Z2_qZAzgEW5BPObymnHA",
  authDomain: "tripmate-ef0bb.firebaseapp.com",
  projectId: "tripmate-ef0bb",
  storageBucket: "tripmate-ef0bb.firebasestorage.app",
  messagingSenderId: "609710106627",
  appId: "1:609710106627:web:99a7f8e46249106288c636"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
