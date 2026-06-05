import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useAuth } from "@app/providers/AuthProvider";
import { getLiveClassById, LiveClass } from "@features/educator/services/liveClass";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, VideoOff, ShieldAlert } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@shared/lib/firebase";

export default function StudentJitsiLiveClass() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, firebaseUser } = useAuth();

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [educatorName, setEducatorName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchClassAndEducator = async () => {
      try {
        const docData = await getLiveClassById(id);
        if (docData) {
          setLiveClass(docData);

          // Fetch educator name
          if (docData.educatorId) {
            const edSnap = await getDoc(doc(db, "educators", docData.educatorId));
            if (edSnap.exists()) {
              const data = edSnap.data();
              setEducatorName(
                data.displayName || data.fullName || data.coachingName || "Educator"
              );
            }
          }
        } else {
          toast.error("Live class not found");
        }
      } catch (err) {
        console.error("Error loading live class data:", err);
        toast.error("Error loading live class details");
      } finally {
        setLoading(false);
      }
    };

    fetchClassAndEducator();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Joining Live Classroom...</p>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-soft">
        <VideoOff className="mx-auto h-12 w-12 text-destructive opacity-80" />
        <h3 className="mt-4 text-lg font-bold">Classroom Unreachable</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested live class does not exist or has already completed.
        </p>
        <Button
          className="mt-6 rounded-lg py-4"
          variant="outline"
          onClick={() => navigate("/student/live-classes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  // Strict Audience Checks: Must match branchId, courseId, and batchId
  const isBranchMatch = profile?.branchId === liveClass.branchId;
  const isCourseMatch = profile?.courseId === liveClass.courseId;
  const isBatchMatch = profile?.batchId === liveClass.batchId;
  const isAuthorized = isBranchMatch && isCourseMatch && isBatchMatch;

  if (!isAuthorized) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-xl border border-red-200 bg-red-50/20 p-8 text-center shadow-soft">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-600" />
        <h3 className="mt-4 text-lg font-bold text-red-700">Access Denied</h3>
        <p className="mt-2 text-sm text-red-600/90 leading-relaxed">
          You are not authorized to join this classroom. This live class is scheduled for a different branch, program, or batch audience.
        </p>
        <div className="mt-4 border-t border-red-100 pt-4 text-left text-xs space-y-1 text-muted-foreground">
          <p>
            • Branch: {isBranchMatch ? "✅ Matched" : "❌ Mismatched"}
          </p>
          <p>
            • Program: {isCourseMatch ? "✅ Matched" : "❌ Mismatched"}
          </p>
          <p>
            • Batch: {isBatchMatch ? "✅ Matched" : "❌ Mismatched"}
          </p>
        </div>
        <Button
          className="mt-6 w-full rounded-lg bg-red-600 text-white hover:bg-red-700"
          onClick={() => navigate("/student/live-classes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Classes
        </Button>
      </div>
    );
  }

  const studentName = profile?.displayName || profile?.fullName || "Student";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted"
              onClick={() => navigate("/student/live-classes")}
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold leading-none text-foreground md:text-lg">
                {liveClass.title}
              </h1>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Host: <span className="font-semibold text-foreground">{educatorName}</span>
              </p>
            </div>
            <div className="ml-1">
              <Badge className="flex items-center gap-1.5 rounded-full border-none bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-600">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" />
                LIVE
              </Badge>
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => navigate("/student/live-classes")}
            >
              Leave Room
            </Button>
          </div>
        </div>
      </header>

      {/* Jitsi Call Frame */}
      <main className="relative flex-1 bg-black">
        <div className="absolute inset-0 h-full w-full">
          <JitsiMeeting
            roomName={liveClass.roomName}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              enableEmailInStats: false,
              prejoinPageEnabled: false,
              toolbarButtons: [
                "microphone",
                "camera",
                "closedcaptions",
                "desktop",
                "fullscreen",
                "fodeviceselection",
                "hangup",
                "profile",
                "chat",
                "raisehand",
                "videoquality",
                "filmstrip",
                "tileview",
              ],
            }}
            userInfo={{
              displayName: studentName,
              email: firebaseUser?.email || undefined,
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "100%";
              iframeRef.style.width = "100%";
            }}
          />
        </div>
      </main>
    </div>
  );
}
