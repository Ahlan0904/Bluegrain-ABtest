import { db } from './firebase.js';
import { doc, getDoc } from 'firebase/firestore';

async function showCounts() {
  const aRef = doc(db, 'abTest', 'variantA');
  const bRef = doc(db, 'abTest', 'variantB');
  const aSnap = await getDoc(aRef);
  const bSnap = await getDoc(bRef);

  const aViews = aSnap.exists() ? aSnap.data().views : 0;
  const bViews = bSnap.exists() ? bSnap.data().views : 0;

  document.getElementById('output').innerText =
    `A안 조회수: ${aViews}\nB안 조회수: ${bViews}`;
}

document.getElementById('showData').addEventListener('click', showCounts);
