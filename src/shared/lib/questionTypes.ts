// Canonical question type enum used across the entire platform.
// Legacy values from AI/DPP pipeline are mapped in normalizeQuestionType().
export type QuestionType =
  | "MCQ_SINGLE"
  | "MCQ_MULTI"
  | "MCQ_CASE_STUDY"
  | "FILL_UP"
  | "SUBJECTIVE_LONG";

export type AnswerMode = "text" | "upload";

export const QUESTION_TYPES: QuestionType[] = [
  "MCQ_SINGLE",
  "MCQ_MULTI",
  "MCQ_CASE_STUDY",
  "FILL_UP",
  "SUBJECTIVE_LONG",
];

export type SubQuestion = {
  id: string;
  question: string;
  questionType: "MCQ_SINGLE" | "FILL_UP" | "SUBJECTIVE_LONG";
  options?: string[];
  correctOption?: number;
  referenceAnswer?: string;
  marks: number;
  negativeMarks: number;
};

export const QUESTION_TYPE_CONFIG: Record<
  QuestionType,
  {
    label: string;
    shortLabel: string;
    description: string;
    badgeColor: string;
    supportsOptions: boolean;
    supportsNegativeMarks: boolean;
    supportsCorrectOption: boolean;
    requiresReferenceAnswer: boolean;
    requiresAiEvaluation: boolean;
    studentInputType: "radio" | "text" | "textarea" | "file" | "case_study";
  }
> = {
  MCQ_SINGLE: {
    label: "MCQ (Single Correct)",
    shortLabel: "MCQ",
    description: "Students select one correct option from multiple choices",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    supportsOptions: true,
    supportsNegativeMarks: true,
    supportsCorrectOption: true,
    requiresReferenceAnswer: false,
    requiresAiEvaluation: false,
    studentInputType: "radio",
  },
  MCQ_MULTI: {
    label: "MCQ (Multiple Correct)",
    shortLabel: "Multi-MCQ",
    description: "Students select all correct options from multiple choices",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    supportsOptions: true,
    supportsNegativeMarks: true,
    supportsCorrectOption: true,
    requiresReferenceAnswer: false,
    requiresAiEvaluation: false,
    studentInputType: "radio",
  },
  MCQ_CASE_STUDY: {
    label: "MCQ (Case Study)",
    shortLabel: "Case Study",
    description: "A passage or scenario with multiple MCQ sub-questions",
    badgeColor: "bg-teal-100 text-teal-700 border-teal-200",
    supportsOptions: false,
    supportsNegativeMarks: false,
    supportsCorrectOption: false,
    requiresReferenceAnswer: false,
    requiresAiEvaluation: false,
    studentInputType: "case_study",
  },
  FILL_UP: {
    label: "Fill-ups / One-word",
    shortLabel: "Fill-up",
    description: "Students type a single word or short phrase; matched exactly (case-insensitive)",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
    supportsOptions: false,
    supportsNegativeMarks: true,
    supportsCorrectOption: false,
    requiresReferenceAnswer: true,
    requiresAiEvaluation: false,
    studentInputType: "text",
  },
  SUBJECTIVE_LONG: {
    label: "Subjective (Long)",
    shortLabel: "Long Ans",
    description: "Students write a detailed answer or upload a handwritten image",
    badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
    supportsOptions: false,
    supportsNegativeMarks: true,
    supportsCorrectOption: false,
    requiresReferenceAnswer: true,
    requiresAiEvaluation: true,
    studentInputType: "textarea",
  },
};

export function getQuestionTypeConfig(type?: string) {
  const normalized = normalizeQuestionType(type);
  return QUESTION_TYPE_CONFIG[normalized];
}

export function getQuestionTypeLabel(type?: string): string {
  return getQuestionTypeConfig(type).label;
}

export function getQuestionTypeShortLabel(type?: string): string {
  return getQuestionTypeConfig(type).shortLabel;
}

export function isSubjectiveType(type?: string): boolean {
  const normalized = normalizeQuestionType(type);
  return normalized === "SUBJECTIVE_LONG";
}

export function isCaseStudy(type?: string): boolean {
  return normalizeQuestionType(type) === "MCQ_CASE_STUDY";
}

export function normalizeQuestionType(type?: string | null): QuestionType {
  if (!type) return "MCQ_SINGLE";
  const upper = String(type).toUpperCase().trim();

  // MCQ single correct
  if (
    upper === "MCQ_SINGLE" ||
    upper === "MCQ" ||
    upper === "MULTIPLE_CHOICE" ||
    upper === "MCQ_SINGLE_CORRECT" ||
    upper === "SINGLE_CORRECT_MCQ" ||
    upper === "MCQ_SINGLE_CORRECT"
  )
    return "MCQ_SINGLE";

  // MCQ multiple correct
  if (
    upper === "MCQ_MULTI" ||
    upper === "MCQ_MULTI_CORRECT" ||
    upper === "MCQ_MULTIPLE_CORRECT" ||
    upper === "MULTICORRECT_MCQ" ||
    upper === "MCQ_MULTI"
  )
    return "MCQ_MULTI";

  // Case study
  if (
    upper === "MCQ_CASE_STUDY" ||
    upper === "CASE_STUDY" ||
    upper === "CASESTUDY" ||
    upper === "CASE-STUDY"
  )
    return "MCQ_CASE_STUDY";

  // Subjective long
  if (upper === "SUBJECTIVE_LONG" || upper === "LONG_ANSWER") return "SUBJECTIVE_LONG";

  // Fill-up / one-word — also absorbs legacy SUBJECTIVE_SHORT and UPLOAD types
  if (
    upper === "FILL_UP" ||
    upper === "SUBJECTIVE_SHORT" ||
    upper === "SHORT_ANSWER" ||
    upper === "SHORT" ||
    upper === "SUBJECTIVE" ||
    upper === "UPLOAD" ||
    upper === "FILE_UPLOAD" ||
    upper === "IMAGE_UPLOAD"
  )
    return "FILL_UP";

  return "MCQ_SINGLE";
}

export type AiEvaluationResult = {
  score: number;
  maxScore: number;
  confidence: number;
  feedback: string;
  evaluatedAt?: number;
};
