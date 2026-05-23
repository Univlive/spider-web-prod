import { useEffect, useState } from "react";
import { collection, getDocs, query, where, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@shared/lib/firebase";

type QBOptions = {
  chapters: string[];
  topics: string[];
  tags: string[];
  loading: boolean;
};

/**
 * Fetches QB-derived filter options (chapters, topics, tags).
 * - subjectIds=undefined → fetch all (admin, no scoping)
 * - subjectIds=[] → empty (educator with no accessible subjects)
 * - subjectIds=[...] → filter by those subject IDs
 */
export function useQBOptions(subjectIds?: string[]): QBOptions {
  const [chapters, setChapters] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const key = subjectIds === undefined ? "__all__" : JSON.stringify([...subjectIds].sort());

  useEffect(() => {
    if (Array.isArray(subjectIds) && subjectIds.length === 0) {
      setChapters([]);
      setTopics([]);
      setTags([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        let docs: QueryDocumentSnapshot[];

        if (subjectIds === undefined) {
          const snap = await getDocs(collection(db, "question_bank"));
          docs = snap.docs;
        } else {
          const chunks: string[][] = [];
          for (let i = 0; i < subjectIds.length; i += 30) {
            chunks.push(subjectIds.slice(i, i + 30));
          }
          const snaps = await Promise.all(
            chunks.map((chunk) =>
              getDocs(query(collection(db, "question_bank"), where("subjectId", "in", chunk)))
            )
          );
          docs = snaps.flatMap((snap) => snap.docs);
        }

        if (cancelled) return;

        const chapterSet = new Set<string>();
        const topicSet = new Set<string>();
        const tagSet = new Set<string>();

        docs.forEach((d) => {
          const data = d.data() as Record<string, unknown>;

          const ch = data.chapter;
          if (ch && typeof ch === "string" && ch.trim()) chapterSet.add(ch.trim());

          const t = data.topic;
          if (t && typeof t === "string" && t.trim()) topicSet.add(t.trim());
          const ts = data.topics;
          if (Array.isArray(ts)) {
            ts.forEach((tp) => {
              if (tp && typeof tp === "string" && tp.trim()) topicSet.add(tp.trim());
            });
          }

          const tgs = data.tags;
          if (Array.isArray(tgs)) {
            tgs.forEach((tag) => {
              if (tag && typeof tag === "string" && tag.trim()) tagSet.add(tag.trim());
            });
          }
        });

        setChapters(Array.from(chapterSet).sort());
        setTopics(Array.from(topicSet).sort());
        setTags(Array.from(tagSet).sort());
      } catch (e) {
        console.error("useQBOptions:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { chapters, topics, tags, loading };
}
