import { DocumentReference, arrayUnion, serverTimestamp, setDoc } from "firebase/firestore";

type QBMetaQuestion = {
  chapter?: string;
  topic?: string;
  topics?: string[];
  tags?: string[];
};

export async function updateQBMeta(docRef: DocumentReference, questions: QBMetaQuestion[]) {
  const chapters = new Set<string>();
  const topics = new Set<string>();
  const tags = new Set<string>();

  questions.forEach((q) => {
    if (q.chapter?.trim()) chapters.add(q.chapter.trim());
    if (q.topic?.trim()) topics.add(q.topic.trim());
    (q.topics ?? []).forEach((t) => t?.trim() && topics.add(t.trim()));
    (q.tags ?? []).forEach((g) => g?.trim() && tags.add(g.trim()));
  });

  if (!chapters.size && !topics.size && !tags.size) return;

  await setDoc(
    docRef,
    {
      chapters: arrayUnion(...Array.from(chapters)),
      topics: arrayUnion(...Array.from(topics)),
      tags: arrayUnion(...Array.from(tags)),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
