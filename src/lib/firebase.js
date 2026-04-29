import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCF3_yUywAlGqboYzZEg7a51r1t6ajqPU4',
  authDomain: 'weekly-superstar-tracker.firebaseapp.com',
  projectId: 'weekly-superstar-tracker',
  storageBucket: 'weekly-superstar-tracker.firebasestorage.app',
  messagingSenderId: '435999630313',
  appId: '1:435999630313:web:a46a59fa3b91ee7c54e178',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
