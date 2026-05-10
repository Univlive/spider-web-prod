import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@shared/lib/firebase";
import { useAuth } from "@app/providers/AuthProvider";
import { useEducatorFeatures } from "@shared/hooks/useEducatorFeatures";
import { toast } from "sonner";
import { Button } from "@shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Label } from "@shared/ui/label";
import { Input } from "@shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/ui/select";
import { Checkbox } from "@shared/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/tabs";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  Pause,
  Play,
  Trash2,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

type ContentItem = {
  id: string;
  title: string;
  type: string;
  courseId: string;
  courseName: string;
  branchId: string;
  branchName: string;
};

type DppRecord = {
  id: string;
  title: string;
  difficulty: string;
  contentTitles: string[];
  generatedAt: string;
  status: "generating" | "ready" | "failed";
  testId: string | null;
  errorMessage?: string;
};

type ScheduleRecord = {
  id: string;
  contentTitles: string[];
  difficulty: string;
  startDate: string;
  endDate: string;
  timeOfDay: string;
  targetBatches: string[];
  isActive: boolean;
  lastRunDate: string | null;
  dailyTopics: Record<string, string>;
};

type Batch = { id: string; name: string };

const MONKEY_KING = import.meta.env.VITE_MONKEY_KING_API_URL || "";

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  while (cur <= endDate) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function DppGenerator() {
  const { firebaseUser } = useAuth();
  const educatorUid = firebaseUser?.uid || "";
  const { features, loading: featuresLoading } = useEducatorFeatures(educatorUid);

  // ── Generate Now state ────────────────────────────────────────────────────
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState("medium");
  const [topicHint, setTopicHint] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dpps, setDpps] = useState<DppRecord[]>([]);
  const [usageToday, setUsageToday] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(3);
  const [loadingUsage, setLoadingUsage] = useState(true);

  // ── Schedule Series state ─────────────────────────────────────────────────
  const [schedSelectedIds, setSchedSelectedIds] = useState<Set<string>>(new Set());
  const [schedDifficulty, setSchedDifficulty] = useState("medium");
  const [schedStartDate, setSchedStartDate] = useState("");
  const [schedEndDate, setSchedEndDate] = useState("");
  const [schedTime, setSchedTime] = useState("08:00");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());
  const [dailyTopics, setDailyTopics] = useState<Record<string, string>>({});
  const [bulkTopic, setBulkTopic] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // ── Load content ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!educatorUid) return;
    async function loadContent() {
      setLoadingContent(true);
      const items: ContentItem[] = [];
      try {
        const branchSnap = await getDocs(collection(db, "educators", educatorUid, "branches"));
        for (const bDoc of branchSnap.docs) {
          const branchName = (bDoc.data() as any).name || bDoc.id;
          const courseSnap = await getDocs(
            collection(db, "educators", educatorUid, "branches", bDoc.id, "courses")
          );
          for (const cDoc of courseSnap.docs) {
            const courseName = (cDoc.data() as any).name || cDoc.id;
            const contentSnap = await getDocs(
              collection(
                db,
                "educators",
                educatorUid,
                "branches",
                bDoc.id,
                "courses",
                cDoc.id,
                "content"
              )
            );
            for (const ctDoc of contentSnap.docs) {
              const d = ctDoc.data() as any;
              items.push({
                id: ctDoc.id,
                title: d.title || ctDoc.id,
                type: d.type || "book",
                courseId: cDoc.id,
                courseName,
                branchId: bDoc.id,
                branchName,
              });
            }
          }
        }
      } catch {
        toast.error("Failed to load content");
      }
      setContent(items);
      setLoadingContent(false);
    }
    loadContent();
  }, [educatorUid]);

  // ── Subscribe to DPP records ──────────────────────────────────────────────
  useEffect(() => {
    if (!educatorUid) return;
    return onSnapshot(
      query(
        collection(db, "educators", educatorUid, "dpps"),
        orderBy("generatedAt", "desc"),
        limit(5)
      ),
      (snap) => setDpps(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })))
    );
  }, [educatorUid]);

  // ── Load usage ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser.getIdToken().then((token) => {
      fetch(`${MONKEY_KING}/api/dpp/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setUsageToday(data.usedToday ?? 0);
          setDailyLimit(data.dailyLimit ?? 3);
        })
        .catch(() => {})
        .finally(() => setLoadingUsage(false));
    });
  }, [firebaseUser, dpps.length]);

  // ── Load schedules ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!firebaseUser) return;
    setLoadingSchedules(true);
    firebaseUser.getIdToken().then((token) => {
      fetch(`${MONKEY_KING}/api/dpp/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => setSchedules(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoadingSchedules(false));
    });
  }, [firebaseUser]);

  // ── Load batches when schedule content changes ────────────────────────────
  const schedContent = content.filter((c) => schedSelectedIds.has(c.id));
  const schedCourseIds = [...new Set(schedContent.map((c) => c.courseId))];
  const schedCourseId = schedCourseIds.length === 1 ? schedCourseIds[0] : "";
  const schedBranchId = schedContent[0]?.branchId || "";

  useEffect(() => {
    if (!educatorUid || !schedCourseId || !schedBranchId) {
      setBatches([]);
      setSelectedBatchIds(new Set());
      return;
    }
    getDocs(
      collection(
        db,
        "educators",
        educatorUid,
        "branches",
        schedBranchId,
        "courses",
        schedCourseId,
        "batches"
      )
    )
      .then((snap) =>
        setBatches(snap.docs.map((d) => ({ id: d.id, name: (d.data() as any).name || d.id })))
      )
      .catch(() => {});
  }, [educatorUid, schedCourseId, schedBranchId]);

  // ── Regenerate daily topics table when dates change ───────────────────────
  useEffect(() => {
    if (!schedStartDate || !schedEndDate || schedStartDate > schedEndDate) return;
    const dates = dateRange(schedStartDate, schedEndDate);
    setDailyTopics((prev) => {
      const next: Record<string, string> = {};
      dates.forEach((d) => {
        next[d] = prev[d] ?? "";
      });
      return next;
    });
  }, [schedStartDate, schedEndDate]);

  if (!featuresLoading && !features.dpp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">DPP Generator not included in your plan</h2>
        <p className="text-muted-foreground max-w-sm">
          Upgrade your plan to generate AI-powered daily practice papers for your students.
        </p>
      </div>
    );
  }

  // ── Generate Now helpers ──────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedContent = content.filter((c) => selectedIds.has(c.id));
  const courseIds = [...new Set(selectedContent.map((c) => c.courseId))];
  const courseId = courseIds.length === 1 ? courseIds[0] : "";
  const branchId = selectedContent[0]?.branchId || "";
  const canGenerate = selectedIds.size > 0 && courseIds.length === 1 && !generating && usageToday < dailyLimit;

  const handleGenerate = async () => {
    if (!canGenerate || !firebaseUser) return;
    setGenerating(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${MONKEY_KING}/api/dpp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content_ids: [...selectedIds],
          content_titles: selectedContent.map((c) => c.title),
          difficulty,
          course_id: courseId,
          branch_id: branchId,
          topic_hint: topicHint.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Generation failed");
      toast.success("DPP generation started — check the list below");
      setSelectedIds(new Set());
      setTopicHint("");
      setUsageToday((p) => p + 1);
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate DPP");
    } finally {
      setGenerating(false);
    }
  };

  // ── Schedule helpers ──────────────────────────────────────────────────────
  const toggleSchedContent = (id: string) => {
    setSchedSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBatch = (id: string) => {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyBulkTopic = () => {
    if (!bulkTopic.trim()) return;
    setDailyTopics((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((d) => {
        next[d] = bulkTopic.trim();
      });
      return next;
    });
  };

  const canSaveSchedule =
    schedSelectedIds.size > 0 &&
    schedCourseIds.length === 1 &&
    selectedBatchIds.size > 0 &&
    schedStartDate &&
    schedEndDate &&
    schedStartDate <= schedEndDate;

  const handleSaveSchedule = async () => {
    if (!canSaveSchedule || !firebaseUser) return;
    setSavingSchedule(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${MONKEY_KING}/api/dpp/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content_ids: [...schedSelectedIds],
          content_titles: schedContent.map((c) => c.title),
          course_id: schedCourseId,
          difficulty: schedDifficulty,
          target_batches: [...selectedBatchIds],
          start_date: schedStartDate,
          end_date: schedEndDate,
          time_of_day: schedTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          daily_topics: dailyTopics,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to save schedule");
      toast.success("DPP schedule activated!");
      setSchedules((prev) => [
        {
          id: data.scheduleId,
          contentTitles: schedContent.map((c) => c.title),
          difficulty: schedDifficulty,
          startDate: schedStartDate,
          endDate: schedEndDate,
          timeOfDay: schedTime,
          targetBatches: [...selectedBatchIds],
          isActive: true,
          lastRunDate: null,
          dailyTopics,
        },
        ...prev,
      ]);
      // Reset form
      setSchedSelectedIds(new Set());
      setSelectedBatchIds(new Set());
      setSchedStartDate("");
      setSchedEndDate("");
      setDailyTopics({});
      setBulkTopic("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save schedule");
    } finally {
      setSavingSchedule(false);
    }
  };

  const toggleScheduleActive = async (schedId: string, currentActive: boolean) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${MONKEY_KING}/api/dpp/schedules/${schedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to update schedule");
      setSchedules((prev) =>
        prev.map((s) => (s.id === schedId ? { ...s, isActive: !currentActive } : s))
      );
    } catch {
      toast.error("Failed to update schedule");
    }
  };

  const deleteSchedule = async (schedId: string) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${MONKEY_KING}/api/dpp/schedules/${schedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete schedule");
      setSchedules((prev) => prev.filter((s) => s.id !== schedId));
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  // ── Content grouped ───────────────────────────────────────────────────────
  const grouped: Record<string, { courseName: string; items: ContentItem[] }> = {};
  for (const item of content) {
    const key = `${item.branchId}::${item.courseId}`;
    if (!grouped[key])
      grouped[key] = {
        courseName: `${item.branchName} / ${item.courseName}`,
        items: [],
      };
    grouped[key].items.push(item);
  }

  const scheduleDates = schedStartDate && schedEndDate && schedStartDate <= schedEndDate
    ? dateRange(schedStartDate, schedEndDate)
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" /> DPP Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate AI-powered daily practice papers from your course content
        </p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate" className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Generate Now
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" /> Schedule Series
          </TabsTrigger>
        </TabsList>

        {/* ── Generate Now Tab ── */}
        <TabsContent value="generate" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Select Content</CardTitle>
                    {!loadingUsage && (
                      <span className="text-xs text-muted-foreground">
                        {usageToday}/{dailyLimit} used today
                      </span>
                    )}
                  </div>
                  {selectedContent.length > 0 && courseIds.length > 1 && (
                    <p className="text-xs text-destructive mt-1">
                      Select content from the same course only
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {loadingContent ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : content.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No content uploaded yet.
                    </p>
                  ) : (
                    Object.entries(grouped).map(([key, group]) => (
                      <div key={key} className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {group.courseName}
                        </p>
                        {group.items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedIds.has(item.id)}
                              onCheckedChange={() => toggleSelect(item.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {item.type}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>
                      Topic / Chapter{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      placeholder="e.g. Newton's Laws, Chapter 3"
                      value={topicHint}
                      onChange={(e) => setTopicHint(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Steers both retrieval and question generation toward this topic
                    </p>
                  </div>

                  {selectedContent.length > 0 && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">
                        Selected: {selectedContent.length} item
                        {selectedContent.length !== 1 ? "s" : ""}
                      </p>
                      {selectedContent.map((c) => (
                        <p key={c.id} className="truncate">
                          · {c.title}
                        </p>
                      ))}
                    </div>
                  )}

                  {usageToday >= dailyLimit && (
                    <p className="text-sm text-destructive">
                      Daily limit reached ({dailyLimit}/day). Try again tomorrow.
                    </p>
                  )}

                  <Button className="w-full" onClick={handleGenerate} disabled={!canGenerate}>
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating…
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" /> Generate DPP
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-semibold">Generated DPPs</h2>
              {dpps.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground text-sm">
                    No DPPs generated yet. Select content and click Generate.
                  </CardContent>
                </Card>
              ) : (
                dpps.map((dpp) => (
                  <Card key={dpp.id}>
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{dpp.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {dpp.contentTitles?.join(", ") || ""}
                          </p>
                        </div>
                        <StatusBadge status={dpp.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline" className="capitalize text-xs">
                          {dpp.difficulty}
                        </Badge>
                        <span>{new Date(dpp.generatedAt).toLocaleString()}</span>
                      </div>
                      {dpp.status === "failed" && dpp.errorMessage && (
                        <p className="text-xs text-destructive">{dpp.errorMessage}</p>
                      )}
                      {dpp.status === "ready" && dpp.testId && (
                        <Link
                          to={`/educator/test-series/${dpp.testId}/questions`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> View &amp; Edit Questions
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Schedule Series Tab ── */}
        <TabsContent value="schedule" className="mt-4 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Schedule form */}
            <div className="space-y-4">
              {/* Content picker */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">1. Select Content</CardTitle>
                  {schedContent.length > 0 && schedCourseIds.length > 1 && (
                    <p className="text-xs text-destructive">
                      Select content from the same course only
                    </p>
                  )}
                </CardHeader>
                <CardContent className="max-h-52 overflow-y-auto space-y-4">
                  {loadingContent ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    Object.entries(grouped).map(([key, group]) => (
                      <div key={key} className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {group.courseName}
                        </p>
                        {group.items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={schedSelectedIds.has(item.id)}
                              onCheckedChange={() => toggleSchedContent(item.id)}
                            />
                            <p className="text-sm font-medium truncate flex-1">{item.title}</p>
                          </label>
                        ))}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Config */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">2. Configure Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label>Difficulty</Label>
                    <Select value={schedDifficulty} onValueChange={setSchedDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={schedStartDate}
                        onChange={(e) => setSchedStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={schedEndDate}
                        onChange={(e) => setSchedEndDate(e.target.value)}
                        min={schedStartDate || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Time of Day</Label>
                    <Input
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      DPP will be generated daily at this time (your local timezone)
                    </p>
                  </div>

                  {/* Batch selector */}
                  <div className="space-y-1.5">
                    <Label>Target Batches</Label>
                    {!schedCourseId ? (
                      <p className="text-xs text-muted-foreground">
                        Select content first to see available batches
                      </p>
                    ) : batches.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No batches found for selected course
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                        {batches.map((b) => (
                          <label
                            key={b.id}
                            className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedBatchIds.has(b.id)}
                              onCheckedChange={() => toggleBatch(b.id)}
                            />
                            <span className="text-sm">{b.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Daily topics */}
              {scheduleDates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">3. Daily Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Same topic for all days…"
                        value={bulkTopic}
                        onChange={(e) => setBulkTopic(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={applyBulkTopic}>
                        Apply all
                      </Button>
                    </div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {scheduleDates.map((d) => (
                        <div key={d} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-24 shrink-0">
                            {new Date(d + "T00:00:00").toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <Input
                            placeholder="e.g. Chapter 3 – Newton's Laws"
                            value={dailyTopics[d] ?? ""}
                            onChange={(e) =>
                              setDailyTopics((prev) => ({ ...prev, [d]: e.target.value }))
                            }
                            className="text-xs h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                className="w-full"
                onClick={handleSaveSchedule}
                disabled={!canSaveSchedule || savingSchedule}
              >
                {savingSchedule ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…
                  </>
                ) : (
                  <>
                    <CalendarClock className="h-4 w-4 mr-2" /> Activate Schedule
                  </>
                )}
              </Button>
            </div>

            {/* Right: Active schedules */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Active Schedules</h2>
              {loadingSchedules ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : schedules.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground text-sm">
                    No schedules yet. Create one to auto-publish DPPs daily.
                  </CardContent>
                </Card>
              ) : (
                schedules.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {s.contentTitles?.join(", ") || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.startDate} → {s.endDate} at {s.timeOfDay}
                          </p>
                        </div>
                        <Badge
                          variant={s.isActive ? "default" : "secondary"}
                          className="shrink-0 text-xs"
                        >
                          {s.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="outline" className="capitalize text-xs">
                          {s.difficulty}
                        </Badge>
                        <span>{s.targetBatches?.length ?? 0} batch(es)</span>
                        {s.lastRunDate && <span>Last run: {s.lastRunDate}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => toggleScheduleActive(s.id, s.isActive)}
                        >
                          {s.isActive ? (
                            <>
                              <Pause className="h-3 w-3 mr-1" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" /> Resume
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 text-destructive hover:text-destructive"
                          onClick={() => deleteSchedule(s.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: DppRecord["status"] }) {
  if (status === "generating") {
    return (
      <Badge variant="secondary" className="gap-1 shrink-0">
        <Loader2 className="h-3 w-3 animate-spin" /> Generating
      </Badge>
    );
  }
  if (status === "ready") {
    return (
      <Badge variant="default" className="gap-1 shrink-0 bg-green-600">
        <CheckCircle2 className="h-3 w-3" /> Ready
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1 shrink-0">
      <AlertCircle className="h-3 w-3" /> Failed
    </Badge>
  );
}
