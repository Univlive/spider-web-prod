import { Loader2 } from "lucide-react";
import QuestionBankPage from "@features/admin/QuestionBank";
import { useAuth } from "@app/providers/AuthProvider";

export default function EducatorQuestionBank() {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading question bank...
      </div>
    );
  }

  if (!firebaseUser?.uid) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Unable to resolve educator identity.
      </div>
    );
  }

  return <QuestionBankPage scope="educator" educatorUid={firebaseUser.uid} />;
}
