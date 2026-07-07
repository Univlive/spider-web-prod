import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Skeleton } from "@shared/ui/skeleton";
import { useAuth } from "@app/providers/AuthProvider";
import { getMyResults, type AnswerSheet, type Grading } from "./api";

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

export default function StudentExamResultDetail() {
  const { sheetId } = useParams<{ sheetId: string }>();
  const { firebaseUser } = useAuth();

  const [sheet, setSheet] = useState<AnswerSheet | null>(null);
  const [gradings, setGradings] = useState<Grading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sheetId || !firebaseUser) return;
    firebaseUser
      .getIdToken()
      .then((token) => getMyResults(token, sheetId))
      .then((data) => {
        setSheet(data.sheet);
        setGradings(data.gradings.filter((g) => g.status === "graded" || g.status === "approved"));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sheetId, firebaseUser]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-semibold">{error || "Result not found"}</p>
        <Button asChild variant="outline">
          <Link to="/student/exam-results">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-1">
        <Link to="/student/exam-results">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      <Card className="card-soft border-0 bg-gradient-to-r from-pastel-mint to-pastel-lavender">
        <CardContent className="p-6 text-center">
          <h1 className="mb-2 text-2xl font-bold">{sheet.student_name}</h1>
          <div className="gradient-text mb-2 text-5xl font-bold">
            {sheet.total_marks_awarded ?? 0}/{sheet.total_max_marks ?? 0}
          </div>
          <p className="text-muted-foreground">Your Score</p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {gradings.map((g) => {
          const v = verdict(g.marks_awarded, g.max_marks);
          const steps = g.annotation_json?.steps || [];

          return (
            <Card key={g.id} className="overflow-hidden border-border/50">
              <CardHeader className="border-b border-border/50 bg-muted/20 pb-3 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`border ${v.cls}`}>{v.label}</Badge>
                  <CardTitle className="text-sm font-bold">Question {g.question_no}</CardTitle>
                  <span className="ml-auto text-base font-bold">
                    {g.marks_awarded}/{g.max_marks}
                  </span>
                </div>
                {g.question_text && (
                  <p className="mt-1 text-sm text-muted-foreground">{g.question_text}</p>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Your Answer
                    </p>
                    <div className="max-h-[720px] min-h-[120px] overflow-y-auto rounded-lg border border-border/50 p-2">
                      {g.annotated_image_url ? (
                        <a href={g.annotated_image_url} target="_blank" rel="noreferrer">
                          <img
                            src={g.annotated_image_url}
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
                            <p className="text-xs italic text-muted-foreground">{step.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
