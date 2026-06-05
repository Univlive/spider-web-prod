import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useAuth } from "@app/providers/AuthProvider";
import { getLiveClassById, endLiveClass, LiveClass } from "./services/liveClass";
import { Button } from "@shared/ui/button";
import { Badge } from "@shared/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, VideoOff, PhoneOff } from "lucide-react";
import { db } from "@shared/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function EducatorJitsiLiveClass() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, firebaseUser } = useAuth();

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchClass = async () => {
      try {
        const docData = await getLiveClassById(id);
        if (docData) {
          setLiveClass(docData);
          
          // Auto-transition status to "live" when educator starts hosting the Jitsi room
          if (docData.status === "scheduled") {
            await updateDoc(doc(db, "live_classes", id), {
              status: "live",
            });
            setLiveClass((prev) => prev ? { ...prev, status: "live" } : null);
          }
        } else {
          toast.error("Live class not found");
        }
      } catch (err) {
        console.error("Error loading live class document:", err);
        toast.error("Error loading live class");
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [id]);

  const handleEndClass = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to end this live class? This will close the room for students.")) {
      return;
    }

    setEnding(true);
    try {
      await endLiveClass(id);
      toast.success("Live class ended successfully!");
      navigate("/educator/live-classes");
    } catch (err) {
      console.error("Error ending live class:", err);
      toast.error("Failed to end class");
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Initializing Live Classroom...</p>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-soft">
        <VideoOff className="mx-auto h-12 w-12 text-destructive opacity-80" />
        <h3 className="mt-4 text-lg font-bold">Classroom Unreachable</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested live class room does not exist or has been deleted.
        </p>
        <Button
          className="mt-6 rounded-lg py-4"
          variant="outline"
          onClick={() => navigate("/educator/live-classes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const educatorName = profile?.displayName || profile?.fullName || "Educator";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted"
              onClick={() => navigate("/educator/live-classes")}
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold leading-none text-foreground md:text-lg">
                {liveClass.title}
              </h1>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Room: <span className="font-mono font-semibold text-foreground">{liveClass.roomName}</span>
              </p>
            </div>
            <div className="ml-1 hidden md:block">
              {liveClass.status === "live" ? (
                <Badge className="flex items-center gap-1.5 rounded-full border-none bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-600">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" />
                  LIVE HOSTING
                </Badge>
              ) : (
                <Badge className="shrink-0 rounded-full border-none bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                  UPCOMING
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              className="gradient-bg-destructive flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-soft hover:brightness-105"
              disabled={ending}
              onClick={handleEndClass}
            >
              {ending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PhoneOff className="h-3.5 w-3.5" />
              )}
              End Class
            </Button>
          </div>
        </div>
      </header>

      {/* Main Jitsi Container */}
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
                "recording",
                "sharedvideo",
                "settings",
                "raisehand",
                "videoquality",
                "filmstrip",
                "tileview",
                "mute-everyone",
                "security",
              ],
            }}
            userInfo={{
              displayName: educatorName,
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
