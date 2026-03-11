import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBVXlO9HVG2j8AMDNw2-nzPW_5obMls1Sw',
  authDomain: 'chungus-42913.firebaseapp.com',
  projectId: 'chungus-42913',
  storageBucket: 'chungus-42913.firebasestorage.app',
  messagingSenderId: '234360941699',
  appId: '1:234360941699:web:aa0338002417613dc57fb6',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
