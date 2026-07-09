// grade-engine student-facing API — same pattern as
// features/educator/examGrading/api.ts, scoped to the student's own results.

const GRADE_ENGINE_API = import.meta.env.VITE_GRADE_ENGINE_API_URL?.replace(/\/+$/, "");

export type Step = { title: string; marks_awarded: number; max_marks: number; note: string };
export type Highlight = { box_2d: [number, number, number, number]; note: string };

export type Grading = {
  id: string;
  question_no: string;
  question_text: string | null;
  status: "graded" | "not_attempted" | "failed" | "approved";
  marks_awarded: number | null;
  max_marks: number | null;
  confidence: number | null;
  feedback: string | null;
  annotation_json: { steps: Step[]; highlights_wrong: Highlight[] } | null;
  annotated_image_url: string | null;
};

export type AnswerSheet = {
  id: string;
  exam_id: string;
  student_name: string;
  status: string;
  total_marks_awarded: number | null;
  total_max_marks: number | null;
  created_at: string;
};

async function gradeEngineFetch(token: string | undefined, path: string) {
  const res = await fetch(`${GRADE_ENGINE_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const listMyAnswerSheets = (token: string | undefined) =>
  gradeEngineFetch(token, "/api/student/answer-sheets") as Promise<AnswerSheet[]>;

export const getMyResults = (token: string | undefined, sheetId: string) =>
  gradeEngineFetch(token, `/api/student/answer-sheets/${sheetId}/results`) as Promise<{
    sheet: AnswerSheet;
    gradings: Grading[];
  }>;
