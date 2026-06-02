import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Eye,
  Phone,
  Users,
  User,
} from "lucide-react";
import { db, storage } from "@shared/lib/firebase";
import { useAuth } from "@app/providers/AuthProvider";
import { cn } from "@shared/lib/utils";

type ViolationType =
  | "FACE_MISSING"
  | "MULTIPLE_FACES"
  | "GAZE_AWAY"
  | "PHONE_DETECTED"
  | "IDENTITY_MISMATCH";

type ProctoringSummary = {
  status: string;
  faceMissing: number;
  multipleFaces: number;
  gazeAway: number;
  phoneDetected: number;
  identityMismatch: number;
  focusLoss: number;
  totalViolations: number;
};

type AttemptDoc = {
  studentId: string;
  testId: string;
  testTitle?: string;
  conductedVia?: string;
  proctoringSummary?: ProctoringSummary;
  proctoringScreenshots?: string[]; // Storage paths
  submittedAt?: { seconds: number };
};

const VIOLATION_META: Record<
  ViolationType,
  { label: string; Icon: React.ElementType; color: string }
> = {
  FACE_MISSING: { label: "Face Missing", Icon: User, color: "text-orange-500" },
  MULTIPLE_FACES: { label: "Multiple Faces", Icon: Users, color: "text-red-500" },
  GAZE_AWAY: { label: "Gaze Away", Icon: Eye, color: "text-yellow-500" },
  PHONE_DETECTED: { label: "Phone Detected", Icon: Phone, color: "text-red-600" },
  IDENTITY_MISMATCH: { label: "Identity Mismatch", Icon: Camera, color: "text-destructive" },
};

function severityColor(total: number) {
  if (total === 0) return "text-green-600";
  if (total < 5) return "text-yellow-600";
  if (total < 15) return "text-orange-500";
  return "text-red-600";
}

export default function ProctoringReview() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { firebaseUser } = useAuth();

  const [attempt, setAttempt] = useState<AttemptDoc | null>(null);
  const [screenshotUrls, setScreenshotUrls] = useState<{ path: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "attempts", attemptId));
        if (!snap.exists()) return;
        const data = snap.data() as AttemptDoc;
        setAttempt(data);

        // Resolve screenshot download URLs
        const paths = data.proctoringScreenshots ?? [];
        const resolved = await Promise.all(
          paths.map(async (path) => {
            try {
              const url = await getDownloadURL(ref(storage, path));
              return { path, url };
            } catch {
              return null;
            }
          })
        );
        setScreenshotUrls(resolved.filter(Boolean) as { path: string; url: string }[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading proctoring report…</div>
    );
  }

  if (!attempt) {
    return <div className="py-12 text-center text-muted-foreground">Attempt not found.</div>;
  }

  const summary = attempt.proctoringSummary;
  const total = summary?.totalViolations ?? 0;
  const submittedDate = attempt.submittedAt
    ? new Date(attempt.submittedAt.seconds * 1000).toLocaleString()
    : "—";

  const summaryRows: { key: ViolationType; count: number }[] = [
    { key: "FACE_MISSING", count: summary?.faceMissing ?? 0 },
    { key: "MULTIPLE_FACES", count: summary?.multipleFaces ?? 0 },
    { key: "GAZE_AWAY", count: summary?.gazeAway ?? 0 },
    { key: "PHONE_DETECTED", count: summary?.phoneDetected ?? 0 },
    { key: "IDENTITY_MISMATCH", count: summary?.identityMismatch ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/educator/review-submissions"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Proctoring Report</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {attempt.testTitle ?? attempt.testId} · Submitted {submittedDate}
            </p>
            {attempt.conductedVia === "desktop" && (
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Desktop App
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {total === 0 ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className={cn("h-6 w-6", severityColor(total))} />
            )}
            <div className="text-right">
              <p className={cn("text-2xl font-bold tabular-nums", severityColor(total))}>{total}</p>
              <p className="text-xs text-muted-foreground">total violations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Violation breakdown */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {summaryRows.map(({ key, count }) => {
          const { label, Icon, color } = VIOLATION_META[key];
          return (
            <div key={key} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", count > 0 ? color : "text-muted-foreground/40")} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p
                className={cn(
                  "mt-1.5 text-2xl font-bold tabular-nums",
                  count > 0 ? color : "text-muted-foreground"
                )}
              >
                {count}
              </p>
            </div>
          );
        })}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={cn(
                "h-4 w-4",
                (summary?.focusLoss ?? 0) > 0 ? "text-yellow-500" : "text-muted-foreground/40"
              )}
            />
            <span className="text-xs text-muted-foreground">Focus Loss</span>
          </div>
          <p
            className={cn(
              "mt-1.5 text-2xl font-bold tabular-nums",
              (summary?.focusLoss ?? 0) > 0 ? "text-yellow-500" : "text-muted-foreground"
            )}
          >
            {summary?.focusLoss ?? 0}
          </p>
        </div>
      </div>

      {/* Screenshots */}
      {screenshotUrls.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Flagged Screenshots ({screenshotUrls.length})
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {screenshotUrls.map(({ path, url }) => {
              // Extract violation type from path: "proctoring/{id}/{timestamp}_{TYPE}.jpg"
              const match = path.match(/_([A-Z_]+)\.jpg$/);
              const violationType = (match?.[1] as ViolationType) ?? null;
              const meta = violationType ? VIOLATION_META[violationType] : null;

              return (
                <button
                  key={path}
                  onClick={() => setSelected(selected === url ? null : url)}
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 transition",
                    selected === url ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <img
                    src={url}
                    alt={violationType ?? "screenshot"}
                    className="aspect-video w-full object-cover"
                  />
                  {meta && (
                    <span
                      className={cn(
                        "absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
                      )}
                    >
                      {meta.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Enlarged view */}
          {selected && (
            <div className="mt-2 overflow-hidden rounded-xl border border-border">
              <img
                src={selected}
                alt="Selected screenshot"
                className="max-h-96 w-full object-contain"
              />
            </div>
          )}
        </div>
      )}

      {screenshotUrls.length === 0 && total === 0 && (
        <div className="rounded-xl border border-border bg-card py-10 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <p className="text-sm font-medium text-foreground">No violations detected</p>
          <p className="text-xs text-muted-foreground">This exam session was clean.</p>
        </div>
      )}
    </div>
  );
}
