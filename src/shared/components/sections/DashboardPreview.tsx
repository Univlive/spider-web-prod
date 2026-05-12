import { motion } from "framer-motion";
import {
  Search,
  Bell,
  BarChart3,
  Clock,
  CheckCircle,
  BookOpen,
  Users,
  Calendar,
  Mic,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="section-padding">
      <div className="container-main">
        <motion.div
          className="shadow-elevated overflow-hidden rounded-3xl border border-border bg-card lg:rounded-[2.5rem]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Dashboard Container */}
          <div className="flex">
            {/* Sidebar */}
            <div className="hidden w-56 flex-col border-r border-border bg-card p-5 md:flex">
              <div className="mb-8 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="font-bold">LearnFlow</span>
              </div>

              <nav className="space-y-1">
                {[
                  { icon: BarChart3, label: "Overview", active: true },
                  { icon: BookOpen, label: "Course" },
                  { icon: Users, label: "Resource" },
                  { icon: CheckCircle, label: "AI Powered" },
                  { icon: Mic, label: "Discussion" },
                  { icon: Users, label: "Communities" },
                  { icon: Calendar, label: "Schedule" },
                  { icon: Mic, label: "Recording" },
                ].map((item, i) => (
                  <button
                    key={i}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      item.active
                        ? "bg-foreground font-medium text-background"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-5 lg:p-8">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-bold">Overview</h2>
                <div className="flex items-center gap-4">
                  <div className="hidden items-center gap-2 rounded-full bg-muted px-4 py-2 sm:flex">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Find a course that interests you
                    </span>
                  </div>
                  <button className="rounded-full bg-muted p-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                      <span className="text-sm font-medium text-primary">RR</span>
                    </div>
                    <span className="hidden text-sm font-medium sm:block">Ronal Richards</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Time Spent Card */}
                <div className="bg-orange-light rounded-2xl border border-primary/10 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-primary">Time Spent</span>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-soft">
                      <BarChart3 className="h-3 w-3 text-primary" />
                    </button>
                  </div>
                  <div className="mb-2 text-2xl font-bold">13.6 Hours</div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary" /> Study
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Exams
                    </span>
                  </div>
                  <div className="mt-4 flex h-20 items-end gap-1">
                    {[40, 60, 30, 80, 45, 70, 55, 90, 50, 65, 75, 40].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-primary transition-all hover:bg-primary/80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Performance Card */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Performance</span>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <BarChart3 className="h-3 w-3 text-primary" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative">
                      <svg className="h-28 w-28" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--border))"
                          strokeWidth="8"
                          strokeDasharray="4 4"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          strokeDasharray="201"
                          strokeDashoffset="40"
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">80%</span>
                        <span className="text-xs text-muted-foreground">Performance</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm font-medium text-green-600">
                    You did a great job!
                  </div>
                </div>

                {/* Upcoming Lessons Card */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="mb-4 font-semibold">Upcoming Lesson</h3>
                  <div className="space-y-3">
                    {[
                      { title: "UX Design Fundamentals", time: "5:30hrs", joinable: true },
                      { title: "Motion Design", time: "5:30hrs", joinable: false },
                    ].map((lesson, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl bg-muted p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{lesson.title}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {lesson.time}
                            </div>
                          </div>
                        </div>
                        <button
                          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                            lesson.joinable
                              ? "bg-foreground text-background"
                              : "border border-primary text-primary"
                          }`}
                        >
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { value: "2h 37m Avg.", icon: Clock, color: "bg-green-500" },
                  { value: "21 Tasks", icon: CheckCircle, color: "bg-primary" },
                  { value: "06 Complete", icon: CheckCircle, color: "bg-green-500" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
                  >
                    <div
                      className={`h-10 w-10 rounded-xl ${stat.color}/10 flex items-center justify-center`}
                    >
                      <stat.icon
                        className={`h-5 w-5 ${stat.color === "bg-primary" ? "text-primary" : "text-green-500"}`}
                      />
                    </div>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-center rounded-2xl bg-foreground p-4">
                  <span className="text-2xl">😊</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
