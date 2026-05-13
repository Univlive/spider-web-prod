import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Layers,
  Trophy,
  AlertTriangle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { format, isSameDay } from "date-fns";

import { Calendar as CalendarIcon } from "lucide-react";
import MetricCard from "./MetricCard";
import { Skeleton } from "@shared/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";
import { Calendar } from "@shared/ui/calendar";
import { Button } from "@shared/ui/button";

// Using the same types from Dashboard.tsx
type StudentDoc = any;
type AttemptDoc = any;

interface DashboardStatsGridProps {
  students: StudentDoc[];
  attempts: AttemptDoc[];
  activeBatchesCount: number;
  isLoading: boolean;
}

export default function DashboardStatsGrid({
  students,
  attempts,
  activeBatchesCount,
  isLoading,
}: DashboardStatsGridProps) {
  const navigate = useNavigate();

  // Internal states for Date Pickers
  const [dppDate, setDppDate] = useState<Date | undefined>(new Date());
  const [testDate, setTestDate] = useState<Date | undefined>(new Date());
  const [isDppLoading, setIsDppLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);

  const [isDppPopoverOpen, setIsDppPopoverOpen] = useState(false);
  const [isTestPopoverOpen, setIsTestPopoverOpen] = useState(false);

  // Derived Metrics
  const totalStudents = students.length;

  const { topPerformer, weakStudentsCount } = useMemo(() => {
    if (!attempts.length) return { topPerformer: null, weakStudentsCount: 0 };

    const studentScores: Record<
      string,
      { totalScore: number; maxScore: number; name: string }
    > = {};

    attempts.forEach((a) => {
      const stId = a.studentId;
      if (!stId) return;
      if (!studentScores[stId]) {
        const student = students.find((s) => s.id === stId);
        studentScores[stId] = {
          totalScore: 0,
          maxScore: 0,
          name:
            student?.name ||
            student?.displayName ||
            student?.fullName ||
            a.studentName ||
            "Unknown Student",
        };
      }
      studentScores[stId].totalScore += Number(a.score || 0);
      studentScores[stId].maxScore += Number(a.maxScore || 0);
    });

    let bestScore = -1;
    let bestName = "";
    let weakCount = 0;

    Object.values(studentScores).forEach((st) => {
      if (st.maxScore > 0) {
        const pct = (st.totalScore / st.maxScore) * 100;
        if (pct > bestScore) {
          bestScore = pct;
          bestName = st.name;
        }
        if (pct < 40) {
          // arbitrary threshold for "weak"
          weakCount++;
        }
      }
    });

    return {
      topPerformer:
        bestScore > -1
          ? { name: bestName, score: Math.round(bestScore) }
          : null,
      weakStudentsCount: weakCount,
    };
  }, [attempts]);

  const getAttemptsForDate = (date: Date | undefined, type: "dpp" | "test") => {
    if (!date) return 0;
    return attempts.filter((a) => {
      const d = a.submittedAt?.toMillis
        ? a.submittedAt.toMillis()
        : a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : null;
      if (!d) return false;
      const attemptDate = new Date(d);
      if (!isSameDay(attemptDate, date)) return false;

      const title = String(a.testTitle || "").toLowerCase();
      if (type === "dpp")
        return title.includes("dpp") || title.includes("practice");
      return !title.includes("dpp") && !title.includes("practice");
    }).length;
  };

  const dppAttemptsCount = useMemo(
    () => getAttemptsForDate(dppDate, "dpp"),
    [attempts, dppDate],
  );
  const testAttemptsCount = useMemo(
    () => getAttemptsForDate(testDate, "test"),
    [attempts, testDate],
  );

  const handleDppDateChange = (date: Date | undefined) => {
    setIsDppLoading(true);
    setDppDate(date);
    setTimeout(() => setIsDppLoading(false), 600); // Simulate network delay for specific card
  };

  const handleTestDateChange = (date: Date | undefined) => {
    setIsTestLoading(true);
    setTestDate(date);
    setTimeout(() => setIsTestLoading(false), 600); // Simulate network delay for specific card
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading ? (
        <Skeleton className="h-[120px] w-full rounded-xl" />
      ) : (
        <div
          onClick={() => navigate("/educator/students")}
          className="cursor-pointer h-full transition-transform hover:scale-[1.02]"
        >
          <MetricCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            iconColor="text-blue-500 text-blue-600"
            delay={0.1}
          />
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-[120px] w-full rounded-xl" />
      ) : (
        <div
          onClick={() => navigate("/educator/batches")}
          className="cursor-pointer h-full transition-transform hover:scale-[1.02]"
        >
          <MetricCard
            title="Active Batches"
            value={activeBatchesCount}
            icon={Layers}
            iconColor="text-purple-500 text-purple-600"
            delay={0.2}
          />
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-[120px] w-full rounded-xl" />
      ) : (
        <div
          onClick={() => navigate("/educator/analytics")}
          className="cursor-pointer h-full transition-transform hover:scale-[1.02]"
        >
          <MetricCard
            title={`Top Performer: ${topPerformer ? topPerformer.name : "N/A"}`}
            value={topPerformer ? `${topPerformer.score}%` : "—"}
            icon={Trophy}
            iconColor="text-amber-500 text-amber-600"
            delay={0.3}
          />
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-[120px] w-full rounded-xl" />
      ) : (
        <div
          
          className="cursor-pointer h-full transition-transform hover:scale-[1.02]"
        >
          <MetricCard
            title="Needs Attention (< 40%)"
            value={weakStudentsCount}
            icon={AlertTriangle}
            iconColor="text-red-500 text-red-600"
            delay={0.4}
          />
        </div>
      )}

      <div className="h-full">
        {isLoading || isDppLoading ? (
          <Skeleton className="h-[120px] w-full rounded-xl" />
        ) : (
          <div
            
            className="cursor-pointer h-full transition-transform hover:scale-[1.02]"
          >
            <MetricCard
              title={
                <div className="flex flex-col gap-1 items-start">
                  <span>DPP Attempts</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Popover
                      open={isDppPopoverOpen}
                      onOpenChange={setIsDppPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {dppDate
                            ? format(dppDate, "MMM d, yyyy")
                            : "Any Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dppDate}
                          onSelect={(d) => {
                            handleDppDateChange(d);
                            setIsDppPopoverOpen(false);
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              }
              value={dppAttemptsCount}
              icon={FileText}
              iconColor="text-green-500 text-green-600"
              delay={0.5}
            />
          </div>
        )}
      </div>

      <div className="h-full">
        {isLoading || isTestLoading ? (
          <Skeleton className="h-[120px] w-full rounded-xl" />
        ) : (
          <div
           
            className="cursor-pointer h-full transition-transform hover:scale-[1.02]"
          >
            <MetricCard
              title={
                <div className="flex flex-col gap-1 items-start">
                  <span>Test Attempts</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Popover
                      open={isTestPopoverOpen}
                      onOpenChange={setIsTestPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {testDate
                            ? format(testDate, "MMM d, yyyy")
                            : "Any Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={testDate}
                          onSelect={(d) => {
                            handleTestDateChange(d);
                            setIsTestPopoverOpen(false);
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              }
              value={testAttemptsCount}
              icon={CheckCircle2}
              iconColor="text-indigo-500 text-indigo-600"
              delay={0.6}
            />
          </div>
        )}
      </div>
    </div>
  );
}
