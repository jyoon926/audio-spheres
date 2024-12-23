import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./FirebaseConfig";
import { Sphere, Track, TreeNode } from "./Types";

export class FirestoreError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'FirestoreError';
  }
}

export const fetchUser = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw new FirestoreError("Failed to fetch user", "fetch-user-error");
  }
};

export const fetchSphere = async (userId: string, sphereId: string) => {
  try {
    const docRef = doc(db, "users", userId, "spheres", sphereId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw new FirestoreError("Failed to fetch sphere", "fetch-sphere-error");
  }
};

export const fetchSpheres = async (userId: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, "users", userId, "spheres"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new FirestoreError("Failed to fetch spheres", "fetch-spheres-error");
  }
};

export const fetchSpheresCount = async (userId: string) => {
  try {
    const snapshot = await getCountFromServer(collection(db, "users", userId, "spheres"));
    return snapshot.data().count;
  } catch (error) {
    throw new FirestoreError("Failed to get spheres count", "fetch-count-error");
  }
};

export const createSphere = async (userId: string, rootNode: TreeNode<Track>) => {
  try {
    const data = {
      title: "New Sphere",
      description: `A Sphere inspired by '${rootNode.value.name}' by ${rootNode.value.artists[0].name}.`,
      rootNode,
      createdAt: serverTimestamp(),
      lastEditedAt: serverTimestamp(),
    };
    return await addDoc(collection(db, "users", userId, "spheres"), data);
  } catch (error) {
    throw new FirestoreError("Failed to create sphere", "create-sphere-error");
  }
};

export const updateSphere = async (userId: string, sphere: Sphere, updates: Partial<Sphere>) => {
  try {
    const docRef = doc(db, "users", userId, "spheres", sphere.id);
    await updateDoc(docRef, { ...updates, lastEditedAt: serverTimestamp() });
  } catch (error) {
    throw new FirestoreError("Failed to update sphere", "update-sphere-error");
  }
};

export const deleteSphere = async (userId: string, sphere: Sphere) => {
  try {
    const docRef = doc(db, "users", userId, "spheres", sphere.id);
    await deleteDoc(docRef);
  } catch (error) {
    throw new FirestoreError("Failed to delete sphere", "delete-sphere-error");
  }
};
