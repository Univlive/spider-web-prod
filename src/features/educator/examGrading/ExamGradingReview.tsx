import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Skeleton } from "@shared/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@shared/ui/collapsible";
import { useAuth } from "@app/providers/AuthProvider";
import { approveGrading, getResults, overrideGrading, type AnswerSheet, type Grading } from "./api";

type ReviewState = { marks: string; reason: string; saving: boolean };

function verdict(marksAwarded: number | null, maxMarks: number | null) {
  const m = marksAwarded ?? 0;
  const max = maxMarks ?? 0;
  if (max <= 0 || m <= 0)
    return { label: "INCORRECT", cls: "bg-red-100 text-red-700 border-red-200" };
  if (m >= max) return { label: "CORRECT", cls: "bg-green-100 text-green-700 border-green-200" };
  return { label: "PARTIAL", cls: "bg-amber-100 text-amber-700 border-amber-200" };
}

function stepBarClass(marksAwarded: number, maxMarks: number) {
  if (maxMarks <= 0 || marksAwarded <= 0) return "bg-red-500";
  if (marksAwarded >= maxMarks) return "bg-green-500";
  return "bg-amber-500";
}

export default function ExamGradingReview() {
  const { sheetId } = useParams<{ examId: string; sheetId: string }>();
  const { firebaseUser } = useAuth();

  const [sheet, setSheet] = useState<AnswerSheet | null>(null);
  const [gradings, setGradings] = useState<Grading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewStates, setReviewStates] = useState<Record<string, ReviewState>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    load();
  }, [sheetId, firebaseUser]);

  async function load() {
    if (!sheetId || !firebaseUser) return;
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const data = await getResults(token, sheetId);
      setSheet(data.sheet);
      setGradings(data.gradings.filter((g) => g.status === "graded" || g.status === "approved"));
      setExpanded({});
      const initial: Record<string, ReviewState> = {};
      for (const g of data.gradings) {
        initial[g.id] = { marks: String(g.marks_awarded ?? 0), reason: "", saving: false };
      }
      setReviewStates(initial);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOverride(grading: Grading) {
    const state = reviewStates[grading.id];
    const marks = Number(state.marks);
    if (!Number.isFinite(marks) || marks < 0 || marks > (grading.max_marks ?? 0)) {
      return toast.error(`Marks must be between 0 and ${grading.max_marks}`);
    }

    setReviewStates((prev) => ({ ...prev, [grading.id]: { ...prev[grading.id], saving: true } }));
    try {
      const token = await firebaseUser?.getIdToken();
      await overrideGrading(token, grading.id, marks, state.reason.trim());
      setGradings((prev) =>
        prev.map((g) =>
          g.id === grading.id ? { ...g, marks_awarded: marks, teacher_approved: true } : g
        )
      );
      toast.success("Grade updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setReviewStates((prev) => ({
        ...prev,
        [grading.id]: { ...prev[grading.id], saving: false },
      }));
    }
  }

  async function handleApprove(grading: Grading) {
    try {
      const token = await firebaseUser?.getIdToken();
      await approveGrading(token, grading.id);
      setGradings((prev) =>
        prev.map((g) => (g.id === grading.id ? { ...g, teacher_approved: true } : g))
      );
      toast.success("Approved");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-semibold">{error || "Answer sheet not found"}</p>
        <Button asChild variant="outline">
          <Link to="/educator/exam-grading">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-1">
          <Link to={`/educator/exam-grading/${sheet.exam_id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{sheet.student_name}</h1>
          <p className="text-sm text-muted-foreground">
            Total: {sheet.total_marks_awarded ?? 0}/{sheet.total_max_marks ?? 0}
          </p>
        </div>
        {gradings.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const allOpen = gradings.every((g) => expanded[g.id]);
              const next: Record<string, boolean> = {};
              for (const g of gradings) next[g.id] = !allOpen;
              setExpanded(next);
            }}
          >
            {gradings.every((g) => expanded[g.id]) ? "Collapse All" : "Expand All"}
          </Button>
        )}
      </div>

      {gradings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            {sheet.status === "processing"
              ? "Grading is in progress — questions will appear here as they're graded."
              : sheet.status === "pending"
                ? "Grading is queued and hasn't started yet."
                : sheet.status === "failed"
                  ? "Grading failed for this sheet — check back after a retry, or contact support."
                  : "No graded questions yet — grading may still be in progress."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {gradings.map((g) => {
            const v = verdict(g.marks_awarded, g.max_marks);
            const state = reviewStates[g.id];
            const steps = g.annotation_json?.steps || [];
            const isOpen = !!expanded[g.id];

            return (
              <Card key={g.id} className="overflow-hidden border-border/50">
                <Collapsible
                  open={isOpen}
                  onOpenChange={(open) => setExpanded((prev) => ({ ...prev, [g.id]: open }))}
                >
                  <CollapsibleTrigger asChild>
                    <button type="button" className="block w-full text-left">
                      <CardHeader className="border-b border-border/50 bg-muted/20 pb-3 pt-4 transition-colors hover:bg-muted/30">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`border ${v.cls}`}>{v.label}</Badge>
                          <CardTitle className="text-sm font-bold">
                            Question {g.question_no}
                          </CardTitle>
                          <span className="ml-auto text-base font-bold">
                            {g.marks_awarded}/{g.max_marks}
                          </span>
                          {g.teacher_approved && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </Badge>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                        {g.question_text && (
                          <p className="mt-1 text-sm text-muted-foreground">{g.question_text}</p>
                        )}
                      </CardHeader>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Student's Work
                          </p>
                          <div className="max-h-[720px] min-h-[120px] overflow-y-auto rounded-lg border border-border/50 p-2">
                            {g.annotated_image_url || g.cropped_image_url ? (
                              <a
                                href={g.annotated_image_url || g.cropped_image_url!}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={g.annotated_image_url || g.cropped_image_url!}
                                  alt={`Question ${g.question_no} answer`}
                                  className="w-full rounded"
                                />
                              </a>
                            ) : (
                              <p className="p-3 text-sm italic text-muted-foreground">
                                No image available
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Step-by-Step Analysis
                          </p>
                          <div className="space-y-2">
                            {steps.map((step, i) => (
                              <div key={i} className="flex gap-2 rounded-lg bg-muted/30 p-3">
                                <div
                                  className={`w-1.5 shrink-0 rounded-full ${stepBarClass(step.marks_awarded, step.max_marks)}`}
                                />
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                      Step {i + 1}
                                    </span>
                                    <span className="text-xs font-bold">
                                      {step.marks_awarded}/{step.max_marks}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium">{step.title}</p>
                                  <p className="text-xs italic text-muted-foreground">
                                    {step.note}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {g.feedback && (
                        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                          {g.feedback}
                        </div>
                      )}

                      <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Override Grade
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium">Marks</label>
                            <input
                              type="number"
                              min={0}
                              max={g.max_marks ?? undefined}
                              step={0.5}
                              value={state?.marks ?? ""}
                              onChange={(e) =>
                                setReviewStates((prev) => ({
                                  ...prev,
                                  [g.id]: { ...prev[g.id], marks: e.target.value },
                                }))
                              }
                              className="w-20 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-sm text-muted-foreground">/ {g.max_marks}</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Reason for override (optional)"
                            value={state?.reason ?? ""}
                            onChange={(e) =>
                              setReviewStates((prev) => ({
                                ...prev,
                                [g.id]: { ...prev[g.id], reason: e.target.value },
                              }))
                            }
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleOverride(g)}
                              disabled={state?.saving}
                            >
                              {state?.saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save Override
                            </Button>
                            {!g.teacher_approved && (
                              <Button size="sm" variant="outline" onClick={() => handleApprove(g)}>
                                Approve As-Is
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
