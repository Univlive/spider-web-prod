import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { toast } from "sonner";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Skeleton } from "@shared/ui/skeleton";
import { cn } from "@shared/lib/utils";
import { useAuth } from "@app/providers/AuthProvider";
import { useTenant } from "@app/providers/TenantProvider";
import { db } from "@shared/lib/firebase";
import { listMyAnswerSheets, type AnswerSheet } from "./examResults/api";

// ── helpers ─────────────────────────────────────────────────────────────────

function toMillis(v: any): number {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const ms = Date.parse(v);
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v?.seconds === "number") return v.seconds * 1000;
  return 0;
}

const SHEET_STATUS_CLASS: Record<string, string> = {
  uploaded: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  graded: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

type Tab = "online" | "paper";

// ── component ────────────────────────────────────────────────────────────────

export default function StudentAllResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "paper" ? "paper" : "online";

  const { firebaseUser, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const educatorId = tenant?.educatorId ?? null;

  // ── Online (Firestore) ───────────────────────────────────────────────────

  type OnlineAttempt = {
    id: string;
    testTitle: string;
    subject: string;
    score: number;
    maxScore: number;
    status: string;
    createdAtMs: number;
  };

  const [onlineLoading, setOnlineLoading] = useState(true);
  const [onlineAttempts, setOnlineAttempts] = useState<OnlineAttempt[]>([]);

  useEffect(() => {
    if (authLoading || tenantLoading || !firebaseUser?.uid || !educatorId) {
      setOnlineLoading(authLoading || tenantLoading);
      return;
    }
    setOnlineLoading(true);
    const q = query(
      collection(db, "attempts"),
      where("studentId", "==", firebaseUser.uid),
      where("educatorId", "==", educatorId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setOnlineAttempts(
          snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              testTitle: String(data.testTitle || "Untitled Test"),
              subject: String(data.subject || ""),
              score: Number(data.score ?? 0),
              maxScore: Number(data.maxScore ?? 0),
              status: String(data.status || "in-progress"),
              createdAtMs: toMillis(data.createdAt),
            };
          })
        );
        setOnlineLoading(false);
      },
      () => setOnlineLoading(false)
    );
    return () => unsub();
  }, [authLoading, tenantLoading, firebaseUser?.uid, educatorId]);

  // ── Paper (grade-engine) ─────────────────────────────────────────────────

  const [paperLoading, setPaperLoading] = useState(true);
  const [sheets, setSheets] = useState<AnswerSheet[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;
    setPaperLoading(true);
    firebaseUser
      .getIdToken()
      .then((token) => listMyAnswerSheets(token))
      .then(setSheets)
      .catch((e) => toast.error(e.message))
      .finally(() => setPaperLoading(false));
  }, [firebaseUser]);

  // ── Tab switch ────────────────────────────────────────────────────────────

  function switchTab(t: Tab) {
    setSearchParams({ tab: t }, { replace: true });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Results</h1>
          <p className="text-sm text-muted-foreground">All your exam results in one place</p>
        </div>

        {/* Tab toggle */}
        <div className="inline-flex w-fit shrink-0 rounded-lg border border-border/50 bg-muted/30 p-1">
          <button
            onClick={() => switchTab("online")}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-200",
              tab === "online"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Online Tests
          </button>
          <button
            onClick={() => switchTab("paper")}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-200",
              tab === "paper"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Paper Exams
          </button>
        </div>
      </div>

      {/* Online tab */}
      {tab === "online" && <OnlineTab loading={onlineLoading} attempts={onlineAttempts} />}

      {/* Paper tab */}
      {tab === "paper" && <PaperTab loading={paperLoading} sheets={sheets} />}
    </div>
  );
}

// ── Online tab ───────────────────────────────────────────────────────────────

function OnlineTab({
  loading,
  attempts,
}: {
  loading: boolean;
  attempts: {
    id: string;
    testTitle: string;
    subject: string;
    score: number;
    maxScore: number;
    status: string;
    createdAtMs: number;
  }[];
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-16 text-center text-muted-foreground">
          No online test attempts yet. Take a test to see your results here.
        </CardContent>
      </Card>
    );
  }

  function statusLabel(s: string) {
    const n = s.toLowerCase();
    if (n === "submitted" || n === "completed" || n === "complete") return "completed";
    if (n === "expired") return "expired";
    return "in-progress";
  }

  const STATUS_BADGE: Record<string, string> = {
    completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    expired: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  return (
    <div className="space-y-3">
      {attempts.map((a) => {
        const st = statusLabel(a.status);
        return (
          <Link key={a.id} to={`/student/results/${a.id}`}>
            <Card className="border-border/50 transition-colors hover:border-primary">
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.testTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.subject && <span>{a.subject} · </span>}
                    {a.createdAtMs ? new Date(a.createdAtMs).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  {st === "completed" && (
                    <span className="text-sm font-bold">
                      {a.score}/{a.maxScore}
                    </span>
                  )}
                  <Badge className={STATUS_BADGE[st] || STATUS_BADGE["in-progress"]}>{st}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

// ── Paper tab ────────────────────────────────────────────────────────────────

function PaperTab({ loading, sheets }: { loading: boolean; sheets: AnswerSheet[] }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-16 text-center text-muted-foreground">
          No paper exam results yet. Your teacher will upload your answer sheet after the exam.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sheets.map((s) => (
        <Link key={s.id} to={`/student/exam-results/${s.id}`}>
          <Card className="border-border/50 transition-colors hover:border-primary">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{s.student_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {s.total_marks_awarded != null && (
                  <span className="text-sm font-bold">
                    {s.total_marks_awarded}/{s.total_max_marks}
                  </span>
                )}
                <Badge className={SHEET_STATUS_CLASS[s.status] || SHEET_STATUS_CLASS.uploaded}>
                  {s.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
