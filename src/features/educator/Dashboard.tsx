import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  FileText,
  KeyRound,
  Target,
  Copy,
  Check,
  Plus,
  BarChart3,
  Radio,
  CreditCard,
} from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import MetricCard from "@features/educator/components/MetricCard";
import EmptyState from "@features/educator/components/EmptyState";
import { Button } from "@shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { db } from "@shared/lib/firebase";
import { useAuth } from "@app/providers/AuthProvider";
import { buildTenantUrl } from "@shared/lib/tenant";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import DashboardStatsGrid from "./components/DashboardStatsGrid";
import AttemptsAnalyticsChart from "./components/AttemptsAnalyticsChart";
import RecentActivityFeed from "./components/RecentActivityFeed";

type BranchDoc = { id: string; name: string };
type CourseDoc = { id: string; name: string; branchId: string };
type BatchDoc = { id: string; name: string; courseId: string; branchId: string };

type StudentDoc = { id: string; status?: string; isActive?: boolean; branchId?: string; courseId?: string; batchId?: string };
type AccessCodeDoc = {
  id: string;
  maxUses?: number;
  usesUsed?: number;
  expiresAt?: any;
  windowMinutes?: number;
  createdAt?: any;
};
type AttemptDoc = { 
  id: string; 
  status?: string; 
  score?: number; 
  maxScore?: number;
  studentId?: string;
  studentName?: string;
  testTitle?: string;
  createdAt?: any;
  submittedAt?: any;
};
type EducatorProfileDoc = {
  displayName?: string;
  fullName?: string;
  name?: string;
  coachingName?: string;
  seatLimit?: number;
  tenantSlug?: string;
  lastPlanId?: string;
  allowedCourseIds?: string[];
};

const LIVE_STATUSES = ["in-progress", "inprogress", "running", "started"];

function accessCodeActive(code: AccessCodeDoc): boolean {
  const maxUses = Number(code.maxUses ?? 0);
  const used = Number(code.usesUsed ?? 0);
  if (maxUses > 0 && used >= maxUses) return false;
  const exp = code.expiresAt;
  if (exp) {
    const ms =
      typeof exp?.toMillis === "function"
        ? exp.toMillis()
        : typeof exp?.seconds === "number"
        ? exp.seconds * 1000
        : 0;
    if (ms && ms < Date.now()) return false;
  }
  return true;
}

function isCompleted(status?: string) {
  const s = String(status || "").toLowerCase();
  return s === "submitted" || s === "completed" || s === "finished";
}

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const uid = firebaseUser?.uid || null;
  const educatorId = profile?.educatorId || uid;

  const [educatorDoc, setEducatorDoc] = useState<EducatorProfileDoc | null>(null);
  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<AttemptDoc[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCodeDoc[]>([]);
  const [usedSeats, setUsedSeats] = useState(0);
  const [planName, setPlanName] = useState<string | null>(null);
  const [allowedCourseNames, setAllowedCourseNames] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  // Real data filter states
  const [allBranches, setAllBranches] = useState<BranchDoc[]>([]);
  const [allCourses, setAllCourses] = useState<CourseDoc[]>([]);
  const [allBatches, setAllBatches] = useState<BatchDoc[]>([]);
  
  const [selectedBranchName, setSelectedBranchName] = useState<string>("All");
  const [selectedCourseName, setSelectedCourseName] = useState<string>("All");
  const [selectedBatchName, setSelectedBatchName] = useState<string>("All");

  const [isFiltering, setIsFiltering] = useState(false);

  const uniqueBranches = useMemo(() => Array.from(new Set(allBranches.map(b => b.name))).sort(), [allBranches]);
  const uniqueCourses = useMemo(() => Array.from(new Set(allCourses.map(c => c.name))).sort(), [allCourses]);
  const uniqueBatches = useMemo(() => Array.from(new Set(allBatches.map(b => b.name))).sort(), [allBatches]);

  useEffect(() => {
    if (uniqueBranches.length === 1 && selectedBranchName === "All") {
      setSelectedBranchName(uniqueBranches[0]);
    }
  }, [uniqueBranches, selectedBranchName]);

  useEffect(() => {
    if (uniqueCourses.length === 1 && selectedCourseName === "All") {
      setSelectedCourseName(uniqueCourses[0]);
    }
  }, [uniqueCourses, selectedCourseName]);

  useEffect(() => {
    if (uniqueBatches.length === 1 && selectedBatchName === "All") {
      setSelectedBatchName(uniqueBatches[0]);
    }
  }, [uniqueBatches, selectedBatchName]);

  useEffect(() => {
    if (!educatorId) return;

    let doneCount = 0;
    const markDone = () => {
      doneCount++;
      if (doneCount >= 6) setLoaded(true);
    };

    const u1 = onSnapshot(
      doc(db, "educators", educatorId),
      (snap) => { setEducatorDoc(snap.exists() ? (snap.data() as EducatorProfileDoc) : null); markDone(); },
      () => { setEducatorDoc(null); markDone(); }
    );

    const u2 = onSnapshot(
      collection(db, "educators", educatorId, "students"),
      (snap) => { setStudents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))); markDone(); },
      () => { setStudents([]); markDone(); }
    );

    const u3 = onSnapshot(
      collection(db, "educators", educatorId, "my_tests"),
      (snap) => { setTests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))); markDone(); },
      () => { setTests([]); markDone(); }
    );

    const u4 = onSnapshot(
      query(collection(db, "attempts"), where("educatorId", "==", educatorId)),
      (snap) => { setAttempts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))); markDone(); },
      () => { setAttempts([]); markDone(); }
    );

    const u5 = onSnapshot(
      collection(db, "educators", educatorId, "accessCodes"),
      (snap) => { setAccessCodes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))); markDone(); },
      () => { setAccessCodes([]); markDone(); }
    );

    const u6 = onSnapshot(
      query(collection(db, "educators", educatorId, "billingSeats"), where("status", "==", "active")),
      (snap) => { setUsedSeats(snap.size); markDone(); },
      () => { setUsedSeats(0); markDone(); }
    );

    return () => { u1(); u2(); u3(); u4(); u5(); u6(); };
  }, [educatorId]);

  useEffect(() => {
    const lastPlanId = educatorDoc?.lastPlanId;
    if (!lastPlanId) { setPlanName(null); return; }
    getDoc(doc(db, "plans", lastPlanId)).then((snap) => {
      setPlanName(snap.exists() ? ((snap.data() as any)?.name || lastPlanId) : lastPlanId);
    }).catch(() => setPlanName(lastPlanId));
  }, [educatorDoc?.lastPlanId]);

  useEffect(() => {
    const ids = educatorDoc?.allowedCourseIds;
    if (!ids || ids.length === 0) { setAllowedCourseNames([]); return; }
    getDocs(collection(db, "courses")).then((snap) => {
      const names = snap.docs
        .filter((d) => ids.includes(d.id))
        .map((d) => (d.data() as any).name || d.id);
      setAllowedCourseNames(names);
    }).catch(() => setAllowedCourseNames([]));
  }, [educatorDoc?.allowedCourseIds]);

  // Fetch all branches, courses, and batches
  useEffect(() => {
    if (!educatorId) return;
    const unsub = onSnapshot(collection(db, "educators", educatorId, "branches"), async (snap) => {
      const branchesData = snap.docs.map((d) => ({ id: d.id, name: d.data().name || "Unknown Branch" }));
      setAllBranches(branchesData);
      
      const coursesData: CourseDoc[] = [];
      const batchesData: BatchDoc[] = [];
      
      for (const b of branchesData) {
        const cSnap = await getDocs(collection(db, "educators", educatorId, "branches", b.id, "courses"));
        for (const c of cSnap.docs) {
          coursesData.push({ id: c.id, branchId: b.id, name: c.data().name || "Unknown Program" });
          const bSnap = await getDocs(collection(db, "educators", educatorId, "branches", b.id, "courses", c.id, "batches"));
          for (const batch of bSnap.docs) {
            batchesData.push({ id: batch.id, branchId: b.id, courseId: c.id, name: batch.data().name || "Unknown Batch" });
          }
        }
      }
      setAllCourses(coursesData);
      setAllBatches(batchesData);
    });
    return () => unsub();
  }, [educatorId]);

  // Simulated filter delay
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 500);
    return () => clearTimeout(timer);
  }, [selectedBranchName, selectedCourseName, selectedBatchName]);

  const filteredStudents = useMemo(() => {
    const validBranchIds = selectedBranchName === "All" 
      ? new Set(allBranches.map(b => b.id))
      : new Set(allBranches.filter(b => b.name === selectedBranchName).map(b => b.id));

    const validCourseIds = selectedCourseName === "All"
      ? new Set(allCourses.map(c => c.id))
      : new Set(allCourses.filter(c => c.name === selectedCourseName).map(c => c.id));

    const validBatchIds = selectedBatchName === "All"
      ? new Set(allBatches.map(b => b.id))
      : new Set(allBatches.filter(b => b.name === selectedBatchName).map(b => b.id));

    return students.filter(s => {
      if (selectedBranchName !== "All" && !validBranchIds.has(s.branchId as string)) return false;
      if (selectedCourseName !== "All" && !validCourseIds.has(s.courseId as string)) return false;
      if (selectedBatchName !== "All" && !validBatchIds.has(s.batchId as string)) return false;
      return true;
    });
  }, [students, selectedBranchName, selectedCourseName, selectedBatchName, allBranches, allCourses, allBatches]);

  const filteredAttempts = useMemo(() => {
    const validStudentIds = new Set(filteredStudents.map(s => s.id));
    return attempts.filter(a => validStudentIds.has(a.studentId as string));
  }, [attempts, filteredStudents]);

  const liveTests = useMemo(
    () => attempts.filter((a) => LIVE_STATUSES.includes(String(a.status || "").toLowerCase())).length,
    [attempts]
  );

  const avgScore = useMemo(() => {
    const completed = attempts.filter((a) => isCompleted(a.status));
    const scored = completed.filter((a) => Number(a.maxScore) > 0);
    if (!scored.length) return "—";
    const pct =
      scored.reduce((sum, a) => sum + (Number(a.score ?? 0) / Number(a.maxScore)) * 100, 0) /
      scored.length;
    return `${Math.round(pct)}%`;
  }, [attempts]);

  const activeAccessCodes = useMemo(
    () => accessCodes.filter(accessCodeActive).length,
    [accessCodes]
  );

  const seatLimit = Math.max(0, Number(educatorDoc?.seatLimit || 0));
  const vacantSeats = Math.max(0, seatLimit - usedSeats);

  const coachingName = String(
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
    } catch { /* clipboard may be blocked */ }
  }

  if (authLoading || (!loaded && !!educatorId)) {
    return <div className="py-12 text-center text-muted-foreground">Loading dashboard…</div>;
  }

  if (!educatorId) {
    return (
      <EmptyState
        icon={FileText}
        title="Please login as Educator"
        description="You must be logged in to view your dashboard."
        actionLabel="Go to Login"
        onAction={() => navigate("/login?role=educator")}
      />
    );
  }

  if (loaded && tests.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Create your first test series"
        description="Add a test or import from the test bank to unlock learner and performance analytics."
        actionLabel="Open Test Series"
        onAction={() => navigate("/educator/test-series")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="gradient-bg rounded-2xl p-5 md:p-6 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Welcome back, {coachingName}!</h2>
            <p className="text-sm text-white/80 mt-1">Here's your coaching at a glance.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full md:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/30 shrink-0"
            onClick={handleCopyUrl}
            disabled={!coachingUrl}
          >
            {copiedUrl ? (
              <><Check className="h-4 w-4 mr-2" />Copied</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" />Copy Coaching URL</>
            )}
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-1/3">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Branch</label>
          <Select 
            value={selectedBranchName} 
            onValueChange={setSelectedBranchName}
          >
            <SelectTrigger className="w-full bg-white dark:bg-zinc-900">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              {uniqueBranches.length !== 1 && <SelectItem value="All">All Branches</SelectItem>}
              {uniqueBranches.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/3">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Program</label>
          <Select 
            value={selectedCourseName} 
            onValueChange={setSelectedCourseName}
          >
            <SelectTrigger className="w-full bg-white dark:bg-zinc-900">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              {uniqueCourses.length !== 1 && <SelectItem value="All">All Programs</SelectItem>}
              {uniqueCourses.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/3">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Batch</label>
          <Select 
            value={selectedBatchName} 
            onValueChange={setSelectedBatchName}
          >
            <SelectTrigger className="w-full bg-white dark:bg-zinc-900">
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              {uniqueBatches.length !== 1 && <SelectItem value="All">All Batches</SelectItem>}
              {uniqueBatches.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric Cards */}
      <DashboardStatsGrid 
        students={filteredStudents}
        attempts={filteredAttempts}
        activeBatchesCount={allBatches.filter(b => {
          if (selectedBranchName !== "All" && !allBranches.find(br => br.name === selectedBranchName && br.id === b.branchId)) return false;
          if (selectedCourseName !== "All" && !allCourses.find(c => c.name === selectedCourseName && c.id === b.courseId)) return false;
          if (selectedBatchName !== "All" && b.name !== selectedBatchName) return false;
          return true;
        }).length || 0}
        isLoading={isFiltering || !loaded}
      />

      {/* Analytics Chart */}
      <AttemptsAnalyticsChart 
        attempts={filteredAttempts}
        isLoading={isFiltering || !loaded}
      />

      {/* Recent Activity Feed */}
      <RecentActivityFeed 
        attempts={filteredAttempts}
        students={filteredStudents}
        batches={allBatches}
        isLoading={isFiltering || !loaded}
      />

      {/* Seats & Plan */}
      
    </div>
  );
}
