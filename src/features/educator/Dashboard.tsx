import { useEffect, useState } from "react";
import {
  Copy,
  Check,
} from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { Button } from "@shared/ui/button";
import { db } from "@shared/lib/firebase";
import { useAuth } from "@app/providers/AuthProvider";
import { buildTenantUrl } from "@shared/lib/tenant";

type EducatorProfileDoc = {
  displayName?: string;
  fullName?: string;
  name?: string;
  coachingName?: string;
  tenantSlug?: string;
};

export default function EducatorDashboard() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const uid = firebaseUser?.uid || null;
  const educatorId = profile?.educatorId || uid;

  const [educatorDoc, setEducatorDoc] = useState<EducatorProfileDoc | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  useEffect(() => {
    if (!educatorId) return;

    const unsub = onSnapshot(
      doc(db, "educators", educatorId),
      (snap) => { 
        setEducatorDoc(snap.exists() ? (snap.data() as EducatorProfileDoc) : null); 
        setLoaded(true);
      },
      () => { 
        setEducatorDoc(null); 
        setLoaded(true);
      }
    );

    return () => unsub();
  }, [educatorId]);

  const coachingName =
    String(
      educatorDoc?.coachingName ||
        educatorDoc?.displayName ||
        educatorDoc?.name ||
        profile?.displayName ||
        "Your Coaching"
    ).trim() || "Your Coaching";

  const coachingSlug = String(educatorDoc?.tenantSlug || profile?.tenantSlug || "").trim();
  const coachingUrl = coachingSlug ? buildTenantUrl(coachingSlug, "/") : "";

  async function handleCopyUrl() {
    if (!coachingUrl) return;
    try {
      await navigator.clipboard.writeText(coachingUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  }

  if (authLoading || (!loaded && !!educatorId)) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (!educatorId) {
    return (
      <div className="py-12 text-center text-muted-foreground">Please login as Educator</div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="gradient-bg rounded-2xl p-5 text-white md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Welcome back, {coachingName}!</h2>
            <p className="mt-1 text-sm text-white/80">Here's your coaching at a glance.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full shrink-0 border border-white/30 bg-white/15 text-white hover:bg-white/25 md:w-auto"
            onClick={handleCopyUrl}
            disabled={!coachingUrl}
          >
            {copiedUrl ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Coaching URL
              </>
            )}
          </Button>
        </div>
      </div>

    </div>
  );
}
