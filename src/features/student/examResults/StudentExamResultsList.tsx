import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Skeleton } from "@shared/ui/skeleton";
import { useAuth } from "@app/providers/AuthProvider";
import { listMyAnswerSheets, type AnswerSheet } from "./api";

const STATUS_CLASS: Record<string, string> = {
  uploaded: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  graded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function StudentExamResultsList() {
  const { firebaseUser } = useAuth();
  const [sheets, setSheets] = useState<AnswerSheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser
      .getIdToken()
      .then((token) => listMyAnswerSheets(token))
      .then(setSheets)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <FileCheck2 className="hidden h-6 w-6 text-primary md:block" />
        <div>
          <h1 className="text-2xl font-bold">Exam Results</h1>
          <p className="text-sm text-muted-foreground">
            AI-graded answer sheets from your offline exams
          </p>
        </div>
      </div>

      {sheets.length === 0 ? (
        <Card className="card-soft border-0">
          <CardContent className="py-16 text-center text-muted-foreground">
            No exam results yet. Your teacher will upload your answer sheet after the exam.
          </CardContent>
        </Card>
      ) : (
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
                    <Badge className={STATUS_CLASS[s.status] || "bg-slate-100 text-slate-700"}>
                      {s.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
