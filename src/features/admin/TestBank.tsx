import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  ListChecks,
  Loader2,
} from "lucide-react";

import { cn } from "@shared/lib/utils";
import { db } from "@shared/lib/firebase";
import { useAuth } from "@app/providers/AuthProvider";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
  getDoc,
} from "firebase/firestore";

import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Badge } from "@shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";

import EmptyState from "@features/admin/components/EmptyState";
import { toast } from "@shared/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/ui/select";
import { MultiSelect } from "@shared/ui/MultiSelect";

type StatusFilter = "all" | "published" | "draft";

type TestSeries = {
  id: string;
  title: string;
  subject: string;
  level?: string;
  description?: string;

  durationMinutes: number;
  price: number;
  attemptsAllowed: number;

  questionsCount: number;

  isPublished: boolean;
  createdAtTs?: Timestamp | null;
  updatedAtTs?: Timestamp | null;
};

function safeNum(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fmtDate(ts?: Timestamp | null) {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusBadgeClass(published: boolean) {
  return published
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
}

export default function TestBank() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<TestSeries[]>([]);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [subjectFilters, setSubjectFilters] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [allCourses, setAllCourses] = useState<{ id: string; name: string }[]>([]);
  const [allSubjects, setAllSubjects] = useState<{ id: string; name: string; courseId: string }[]>(
    []
  );

  // 🔐 Admin guard (minimal)
  const isAdmin = profile?.role === "ADMIN";

  // Load courses and subjects for filter cascading
  useEffect(() => {
    Promise.all([getDocs(collection(db, "courses")), getDocs(collection(db, "subjects"))]).then(
      ([courseSnap, subjectSnap]) => {
        setAllCourses(
          courseSnap.docs
            .filter((d) => d.data()?.isActive !== false)
            .map((d) => ({ id: d.id, name: d.data().name as string }))
        );
        setAllSubjects(
          subjectSnap.docs.map((d) => ({
            id: d.id,
            name: d.data().name as string,
            courseId: d.data().courseId as string,
          }))
        );
      }
    );
  }, []);

  // Realtime load tests
  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      setLoading(false);
      setTests([]);
      return;
    }

    setLoading(true);

    const qRef = query(collection(db, "test_series"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const rows: TestSeries[] = snap.docs.map((d) => {
          const data = d.data() as any;

          const createdAt = (data?.createdAt as Timestamp) || null;
          const updatedAt = (data?.updatedAt as Timestamp) || null;

          return {
            id: d.id,
            title: String(data?.title || "Untitled Test"),
            subject: String(data?.subject || "General"),
            level: data?.level
              ? String(data.level)
              : data?.difficulty
                ? String(data.difficulty)
                : undefined,
            description: data?.description ? String(data.description) : undefined,

            durationMinutes: safeNum(data?.durationMinutes ?? data?.duration, 60),
            price: Math.max(0, safeNum(data?.price, 0)),
            attemptsAllowed: Math.max(1, safeNum(data?.attemptsAllowed ?? data?.maxAttempts, 3)),

            questionsCount: Math.max(
              0,
              safeNum(data?.questionsCount ?? data?.totalQuestions ?? data?.questionCount, 0)
            ),

            isPublished: Boolean(data?.isPublished ?? data?.published ?? false),
            createdAtTs: createdAt,
            updatedAtTs: updatedAt,
          };
        });

        setTests(rows);
        setLoading(false);
      },
      () => {
        setTests([]);
        setLoading(false);
        toast({
          title: "Failed to load tests",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      }
    );

    return () => unsub();
  }, [authLoading, isAdmin]);

  const subjectOptions = useMemo(() => {
    const pool =
      courseFilter === "all" ? allSubjects : allSubjects.filter((s) => s.courseId === courseFilter);
    return pool.map((s) => s.name).sort();
  }, [allSubjects, courseFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tests.filter((t) => {
      const matchesSearch =
        !q || t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);

      if (courseFilter !== "all") {
        const namesInCourse = allSubjects
          .filter((s) => s.courseId === courseFilter)
          .map((s) => s.name);
        if (!namesInCourse.includes(t.subject)) return false;
      }

      if (subjectFilters.length > 0 && !subjectFilters.includes(t.subject)) return false;

      const matchesStatus =
        status === "all" || (status === "published" ? t.isPublished : !t.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [tests, search, courseFilter, subjectFilters, allSubjects, status]);

  const stats = useMemo(() => {
    const total = tests.length;
    const published = tests.filter((t) => t.isPublished).length;
    const draft = total - published;
    const totalQuestions = tests.reduce((acc, t) => acc + (t.questionsCount || 0), 0);
    return { total, published, draft, totalQuestions };
  }, [tests]);

  async function togglePublish(test: TestSeries) {
    try {
      await updateDoc(doc(db, "test_series", test.id), {
        isPublished: !test.isPublished,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: test.isPublished ? "Unpublished" : "Published",
        description: `${test.title} is now ${test.isPublished ? "draft" : "published"}.`,
      });
    } catch {
      toast({
        title: "Failed",
        description: "Could not update publish status.",
        variant: "destructive",
      });
    }
  }

  async function deleteTest(test: TestSeries) {
    const ok = window.confirm(`Delete "${test.title}"?\n\nThis will also delete its questions.`);
    if (!ok) return;

    try {
      // delete questions first (best-effort)
      const qSnap = await getDocs(collection(db, "test_series", test.id, "questions"));
      if (!qSnap.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const qDoc of qSnap.docs) {
          batch.delete(doc(db, "test_series", test.id, "questions", qDoc.id));
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) await batch.commit();
      }

      await deleteDoc(doc(db, "test_series", test.id));

      toast({ title: "Deleted", description: "Test removed successfully." });
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete the test.",
        variant: "destructive",
      });
    }
  }

  async function duplicateTest(test: TestSeries) {
    try {
      // fetch original doc data (so we copy any fields we don't explicitly track)
      const srcRef = doc(db, "test_series", test.id);
      const srcSnap = await getDoc(srcRef);
      if (!srcSnap.exists()) {
        toast({
          title: "Not found",
          description: "Original test no longer exists.",
          variant: "destructive",
        });
        return;
      }

      const srcData = srcSnap.data() as any;

      // create new test doc
      const newTitle = `${String(srcData?.title || test.title)} (Copy)`;

      const newDocRef = await addDoc(collection(db, "test_series"), {
        ...srcData,
        title: newTitle,
        isPublished: false, // copies always start as draft
        publishedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // copy questions subcollection
      const qSnap = await getDocs(collection(db, "test_series", test.id, "questions"));
      if (!qSnap.empty) {
        let batch = writeBatch(db);
        let ops = 0;

        for (const qDoc of qSnap.docs) {
          batch.set(
            doc(db, "test_series", newDocRef.id, "questions", qDoc.id),
            {
              ...qDoc.data(),
              // keep timestamps if you want, but updatedAt is useful
              duplicatedAt: serverTimestamp(),
            },
            { merge: true }
          );
          ops++;
          if (ops >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            ops = 0;
          }
        }
        if (ops > 0) await batch.commit();
      }

      toast({
        title: "Duplicated",
        description: "Test + questions copied as a draft.",
      });

      // optionally open edit
      navigate(`/admin/tests/edit/${newDocRef.id}`);
    } catch (e) {
      console.error(e);
      toast({
        title: "Duplicate failed",
        description: "Could not duplicate the test.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Test Bank</h1>
            <p className="text-sm text-muted-foreground">Manage global tests (Admin)</p>
          </div>
        </div>

        <Card className="card-soft border-0">
          <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading tests...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Test Bank</h1>
          <p className="text-sm text-muted-foreground">Admin access required</p>
        </div>
        <EmptyState
          icon={BookOpen}
          title="Admin only"
          description="Please login with an Admin account to access the test bank."
          actionLabel="Go to Login"
          onAction={() => (window.location.href = "/login?role=admin")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Test Bank</h1>
          <p className="text-sm text-muted-foreground">Create and manage global tests</p>
        </div>

        <Button className="gradient-bg text-white" onClick={() => navigate("/admin/tests/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Test
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Tests", value: stats.total },
          { label: "Published", value: stats.published },
          { label: "Drafts", value: stats.draft },
          { label: "Total Questions", value: stats.totalQuestions },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="card-soft border-0">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="card-soft border-0">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests by title/description..."
                className="rounded-xl pl-9"
              />
            </div>

            <Select
              value={courseFilter}
              onValueChange={(v) => {
                setCourseFilter(v);
                setSubjectFilters([]);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {allCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-[220px]">
              <MultiSelect
                options={subjectOptions}
                selected={subjectFilters}
                onChange={setSubjectFilters}
                placeholder="All Subjects"
                disabled={subjectOptions.length === 0}
              />
            </div>

            <div className="flex gap-2">
              {(["all", "published", "draft"] as StatusFilter[]).map((st) => (
                <Badge
                  key={st}
                  variant={status === st ? "default" : "secondary"}
                  className="cursor-pointer rounded-full capitalize"
                  onClick={() => setStatus(st)}
                >
                  {st}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No tests found"
          description="Create your first test or adjust filters."
          actionLabel="Create Test"
          onAction={() => navigate("/admin/tests/new")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.25) }}
            >
              <Card className="card-soft border-0 transition-shadow hover:shadow-card">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{t.title}</CardTitle>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          {t.subject}
                        </Badge>
                        {t.level && (
                          <Badge variant="outline" className="rounded-full">
                            {t.level}
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className={cn("rounded-full", statusBadgeClass(t.isPublished))}
                        >
                          {t.isPublished ? "published" : "draft"}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => navigate(`/admin/tests/edit/${t.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/questions/${t.id}`)}>
                          <ListChecks className="mr-2 h-4 w-4" />
                          Manage Questions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateTest(t)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => togglePublish(t)}>
                          {t.isPublished ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteTest(t)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {t.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{t.durationMinutes} min</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Questions</p>
                      <p className="font-medium">{t.questionsCount}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-medium">{t.price > 0 ? `₹${t.price}` : "Free"}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Attempts</p>
                      <p className="font-medium">{t.attemptsAllowed}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {fmtDate(t.createdAtTs || null)}</span>
                    <span>Updated: {fmtDate(t.updatedAtTs || null)}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => navigate(`/admin/questions/${t.id}`)}
                    >
                      Manage Questions
                    </Button>
                    <Button
                      className="gradient-bg flex-1 rounded-xl text-white"
                      onClick={() => navigate(`/admin/tests/edit/${t.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
