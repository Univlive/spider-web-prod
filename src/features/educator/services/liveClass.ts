import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@shared/lib/firebase";

export interface LiveClass {
  id: string;
  title: string;
  educatorId: string;
  roomName: string;
  status: "scheduled" | "live" | "completed";
  branchId: string;
  courseId: string;
  batchId: string;
  createdAt?: any;
}

export async function getLiveClassById(id: string): Promise<LiveClass | null> {
  const docRef = doc(db, "live_classes", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as LiveClass;
  }
  return null;
}

export async function endLiveClass(id: string): Promise<void> {
  const docRef = doc(db, "live_classes", id);
  await updateDoc(docRef, {
    status: "completed",
  });
}
