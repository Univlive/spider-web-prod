import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { 
  Activity, 
  ChevronRight, 
  ClipboardCheck, 
  Clock, 
  AlertCircle,
  PlayCircle
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@shared/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@shared/ui/avatar";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Skeleton } from "@shared/ui/skeleton";
import { cn } from "@shared/lib/utils";

type AttemptDoc = any;
type StudentDoc = any;
type BatchDoc = any;

interface RecentActivityFeedProps {
  attempts: AttemptDoc[];
  students: StudentDoc[];
  batches: BatchDoc[];
  isLoading: boolean;
}

export default function RecentActivityFeed({ 
  attempts, 
  students, 
  batches, 
  isLoading 
}: RecentActivityFeedProps) {
  const navigate = useNavigate();
  const [activityType, setActivityType] = useState<"dpp" | "test">("dpp");
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  // Smooth loading transition on toggle
  useEffect(() => {
    setIsFeedLoading(true);
    const t = setTimeout(() => setIsFeedLoading(false), 400);
    return () => clearTimeout(t);
  }, [activityType, attempts]);

  const activityData = useMemo(() => {
    // 1. Filter by DPP vs Test
    const filtered = attempts.filter(a => {
      const title = String(a.testTitle || "").toLowerCase();
      const isDpp = title.includes("dpp") || title.includes("practice");
      return activityType === "dpp" ? isDpp : !isDpp;
    });

    // 2. Sort by newest
    const sorted = [...filtered].sort((a, b) => {
      const timeA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
      const timeB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
      return timeB - timeA;
    });


    // 3. Take top 10 and map data
    return sorted.slice(0, 10).map(attempt => {
      const student = students.find(s => s.id === attempt.studentId);
      const batch = batches.find(b => b.id === student?.batchId);
      
      const status = String(attempt.status || "").toLowerCase();
      const isCompleted = ["submitted", "completed", "finished"].includes(status);
      const isStarted = ["in-progress", "inprogress", "running", "started"].includes(status);
      
      let activityText = "";
      if (isCompleted) activityText = `Completed ${attempt.testTitle || "Test"}`;
      else if (isStarted) activityText = `Started ${attempt.testTitle || "Test"}`;
      else activityText = `Attempted ${attempt.testTitle || "Test"}`;

      const timestamp = attempt.submittedAt?.toMillis ? attempt.submittedAt.toMillis() : (attempt.createdAt?.toMillis ? attempt.createdAt.toMillis() : null);
      return {
        id: attempt.id,
        studentId: attempt.studentId,
        studentName: student?.name || student?.displayName || student?.fullName || attempt.studentName || "Unknown Student",
        avatar: student?.avatarUrl || "",
        batchName: batch?.name || "No Batch",
        activityText,
        status,
        timestamp,
        isCompleted,
        isStarted
      };
    });
  }, [attempts, students, batches, activityType]);


  const showLoading = isLoading || isFeedLoading;
  const hasActivity = activityData.length > 0;

  const getStatusConfig = (status: string, isCompleted: boolean, isStarted: boolean) => {
    if (isCompleted) return { label: "Completed", variant: "success" as const, icon: ClipboardCheck };
    if (isStarted) return { label: "In Progress", variant: "warning" as const, icon: PlayCircle };
    if (status === "missed") return { label: "Missed", variant: "destructive" as const, icon: AlertCircle };
    return { label: "Pending", variant: "outline" as const, icon: Clock };
  };

  return (
    <Card className="w-full card-hover border-border shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Track latest student participation and engagement.</CardDescription>
        </div>
        
        <Tabs value={activityType} onValueChange={(v: any) => setActivityType(v)} className="w-auto">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="dpp" className="px-4 py-1.5 text-xs">DPP Activity</TabsTrigger>
            <TabsTrigger value="test" className="px-4 py-1.5 text-xs">Test Activity</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
          {showLoading ? (
            <div className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ) : !hasActivity ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="font-medium text-foreground">No recent activity found</p>
              <p className="text-sm mt-1">Try adjusting your filters or switching activity type.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {activityData.map((item) => {
                const config = getStatusConfig(item.status, item.isCompleted, item.isStarted);
                const StatusIcon = config.icon;
                
                return (
                  <div 
                    key={item.id} 
                    className="group p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/educator/analytics`)}
                  >
                    {/* Left: Student Info */}
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <Avatar className="h-10 w-10 border border-border/50 group-hover:border-primary/30 transition-colors">
                        <AvatarImage src={item.avatar} alt={item.studentName} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs">
                          {item.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-foreground leading-tight">
                          {item.studentName}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                          {item.batchName}
                        </p>
                      </div>
                    </div>

                    {/* Center: Activity Text */}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.activityText}
                      </p>
                    </div>

                    {/* Right: Meta */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {item.timestamp ? formatDistanceToNow(item.timestamp, { addSuffix: true }) : "N/A"}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={cn(
                            "px-2 py-0 h-6 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border-none",
                            item.isCompleted ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                            item.isStarted ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            item.status === "missed" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                            "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <StatusIcon className="h-2.5 w-2.5" />
                          {config.label}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 bg-muted/20 border-t border-border/50 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all group"
          onClick={() => navigate(activityType === "dpp" ? "/educator/analytics" : "/educator/analytics")}
        >
          View All Attempts
          <ChevronRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}
