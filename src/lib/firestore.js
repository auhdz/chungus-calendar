import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/* ── Groups ── */

export async function isGroupNameTaken(name) {
  const q = query(
    collection(db, 'groups'),
    where('nameLower', '==', name.trim().toLowerCase()),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function createGroup(name, userId) {
  const taken = await isGroupNameTaken(name);
  if (taken) throw new Error('GROUP_NAME_TAKEN');
  const ref = doc(collection(db, 'groups'));
  await setDoc(ref, {
    name,
    nameLower: name.trim().toLowerCase(),
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getGroup(groupId) {
  const snap = await getDoc(doc(db, 'groups', groupId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/* ── Placements ── */

function placementsCol(groupId) {
  return collection(db, 'groups', groupId, 'placements');
}

export async function addPlacement(groupId, placement) {
  const ref = await addDoc(placementsCol(groupId), {
    ...placement,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePlacementTimeBlocks(groupId, placementId, timeBlockIds) {
  await updateDoc(doc(db, 'groups', groupId, 'placements', placementId), {
    timeBlockIds,
  });
}

export async function updatePlacementUserName(groupId, placementId, userName) {
  await updateDoc(doc(db, 'groups', groupId, 'placements', placementId), {
    userName,
  });
}

export async function deletePlacement(groupId, placementId) {
  await deleteDoc(doc(db, 'groups', groupId, 'placements', placementId));
}

export async function deleteAllUserPlacements(groupId, userId) {
  const q = query(placementsCol(groupId), where('userId', '==', userId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function deleteUserPlacementsOnDate(groupId, userId, date) {
  const q = query(
    placementsCol(groupId),
    where('userId', '==', userId),
    where('date', '==', date),
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export function subscribeToPlacements(groupId, callback) {
  return onSnapshot(placementsCol(groupId), (snap) => {
    const placements = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(placements);
  });
}
