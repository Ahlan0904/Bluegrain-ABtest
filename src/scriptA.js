// script_A.js
import { db } from './firebase.js';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';

async function logView() {
  const docRef = doc(db, 'abTest', 'variantA');
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    await updateDoc(docRef, {
      views: increment(1)
    });
  } else {
    await setDoc(docRef, {
      views: 1
    });
  }
}

document.addEventListener('DOMContentLoaded', logView);
