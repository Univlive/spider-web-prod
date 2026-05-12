import { useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@shared/lib/firebase";
import { useAuth } from "@app/providers/AuthProvider";
import { Button } from "@shared/ui/button";
import { Textarea } from "@shared/ui/textarea";
import { Switch } from "@shared/ui/switch";
import { Label } from "@shared/ui/label";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { Input } from "@shared/ui/input";
import { Checkbox } from "@shared/ui/checkbox";
import { Bot, BookOpen, ChevronLeft, FileText, Loader2, Lock, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@shared/lib/utils";
import { useEducatorFeatures } from "@shared/hooks/useEducatorFeatures";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const API_BASE = import.meta.env.VITE_MONKEY_KING_API_URL as string;

type Screen = "setup" | "chat";

type ContentItem = {
  id: string;
  title: string;
  type: string;
};

type Source = { title: string; excerpt: string };

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

function ContentTypeIcon({ type }: { type: string }) {
  if (type === "book") return <BookOpen className="h-4 w-4 shrink-0 text-primary" />;
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code(props) {
            const { children, className, ...rest } = props;
            const isBlock = className?.includes("language-");
            return isBlock ? (
              <pre className="my-2 overflow-x-auto rounded-lg bg-black/10 p-3 text-xs dark:bg-white/10">
                <code className={className} {...rest}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10" {...rest}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-2 list-decimal space-y-1 pl-4">{children}</ol>;
          },
          h1({ children }) {
            return <h1 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="mb-1.5 mt-3 text-sm font-bold first:mt-0">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-2 border-l-2 border-primary/40 pl-3 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function SourceCitations({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;
  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <BookOpen className="h-3 w-3" />
        {sources.length} source{sources.length > 1 ? "s" : ""}
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-1.5 space-y-1.5">
          {sources.map((s, i) => (
            <div key={i} className="rounded-md bg-muted/60 px-2.5 py-2 text-xs">
              <p className="font-medium text-foreground">{s.title}</p>
              <p className="mt-0.5 line-clamp-2 text-muted-foreground">{s.excerpt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentChatbot() {
  const { profile, firebaseUser } = useAuth();
  const educatorId = profile?.educatorId;
  const { features, loading: featuresLoading } = useEducatorFeatures(educatorId);

  const [screen, setScreen] = useState<Screen>("setup");
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [topicContext, setTopicContext] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useInternet, setUseInternet] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(100_000);
  const [limitReached, setLimitReached] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.educatorId || !profile?.branchId || !profile?.courseId) return;
    async function loadContent() {
      setLoadingContent(true);
      try {
        const snap = await getDocs(
          collection(
            db,
            "educators",
            profile!.educatorId!,
            "branches",
            profile!.branchId!,
            "courses",
            profile!.courseId!,
            "content"
          )
        );
        setContentItems(
          snap.docs
            .filter((d) => d.data().indexed === true)
            .map((d) => ({
              id: d.id,
              title: d.data().title || d.id,
              type: d.data().type || "book",
            }))
        );
      } catch {
        // non-critical
      } finally {
        setLoadingContent(false);
      }
    }
    loadContent();
  }, [profile?.educatorId, profile?.branchId, profile?.courseId]);

  useEffect(() => {
    (async () => {
      try {
        const token = await firebaseUser?.getIdToken();
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/chat/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTokensUsed(data.tokensUsedToday ?? 0);
          setDailyLimit(data.dailyLimit ?? 100_000);
          if (data.tokensUsedToday >= data.dailyLimit) setLimitReached(true);
        }
      } catch {
        // non-critical
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!featuresLoading && !features.chatbot) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">AI Tutor not available</h2>
        <p className="max-w-sm text-muted-foreground">
          The AI Doubt Chatbot is not included in your institute's current plan. Contact your
          educator or admin to enable it.
        </p>
      </div>
    );
  }

  const selectedContent = contentItems.filter((c) => selectedIds.has(c.id));

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startChat() {
    if (selectedIds.size === 0) return;
    setMessages([]);
    setScreen("chat");
  }

  function changeContext() {
    setScreen("setup");
    setMessages([]);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || limitReached) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = await firebaseUser?.getIdToken();
      if (!token) throw new Error("Not logged in");
      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          use_internet: useInternet,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          content_ids: [...selectedIds],
          topic_context: topicContext,
        }),
      });

      if (res.status === 429) {
        const err = await res.json();
        toast.error(err.detail || "Daily limit reached");
        setLimitReached(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.contextSources || [],
        },
      ]);
      setTokensUsed(data.totalUsedToday ?? tokensUsed);
      setDailyLimit(data.dailyLimit ?? dailyLimit);
      if (data.totalUsedToday >= data.dailyLimit) setLimitReached(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to get response");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const usagePct = dailyLimit > 0 ? Math.min((tokensUsed / dailyLimit) * 100, 100) : 0;

  // ── Setup Screen ───────────────────────────────────────────────────────────
  if (screen === "setup") {
    return (
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-6 p-4">
        <div className="pt-4 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">AI Tutor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose what to study, then ask anything
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-5">
            <div>
              <p className="mb-2 text-sm font-semibold">Select content to study from</p>
              {loadingContent ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : contentItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No indexed content available yet. Ask your educator to upload course material.
                </p>
              ) : (
                <div className="max-h-60 space-y-1 overflow-y-auto">
                  {contentItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                      <ContentTypeIcon type={item.type} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs capitalize">
                        {item.type}
                      </Badge>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="topic-input" className="text-sm font-semibold">
                Chapter or topic{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="topic-input"
                placeholder="e.g. Chapter 3 – Laws of Motion"
                value={topicContext}
                onChange={(e) => setTopicContext(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Helps the AI focus on a specific part of the selected content
              </p>
            </div>

            <Button
              className="w-full"
              onClick={startChat}
              disabled={selectedIds.size === 0 || contentItems.length === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Asking
            </Button>
          </CardContent>
        </Card>

        {/* Token usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Daily usage</span>
            <span>
              {tokensUsed.toLocaleString()} / {dailyLimit.toLocaleString()} tokens
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usagePct >= 90 ? "bg-destructive" : usagePct >= 70 ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Chat Screen ────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      {/* Chat header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm">
        <button
          onClick={changeContext}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Change
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {selectedContent.map((c) => (
              <Badge key={c.id} variant="secondary" className="max-w-[180px] truncate text-xs">
                <ContentTypeIcon type={c.type} />
                <span className="ml-1 truncate">{c.title}</span>
              </Badge>
            ))}
            {topicContext && (
              <Badge variant="outline" className="max-w-[160px] truncate text-xs">
                {topicContext}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Label htmlFor="internet-toggle" className="text-xs text-muted-foreground">
            General search
          </Label>
          <Switch id="internet-toggle" checked={useInternet} onCheckedChange={setUseInternet} />
        </div>
      </div>

      {/* Usage bar */}
      <div className="h-0.5 bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            usagePct >= 90 ? "bg-destructive" : usagePct >= 70 ? "bg-amber-500" : "bg-primary"
          )}
          style={{ width: `${usagePct}%` }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
            <Bot className="h-10 w-10 opacity-25" />
            <p className="text-sm">
              Ask anything about{" "}
              <span className="font-medium text-foreground">
                {selectedContent.map((c) => c.title).join(", ")}
              </span>
              {topicContext && (
                <>
                  {" "}
                  — topic: <span className="font-medium text-foreground">{topicContext}</span>
                </>
              )}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex items-start gap-3", msg.role === "user" && "flex-row-reverse")}
          >
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-1",
                msg.role === "assistant"
                  ? "bg-primary text-primary-foreground ring-primary/20"
                  : "bg-muted ring-border"
              )}
            >
              {msg.role === "assistant" ? (
                <Bot className="h-4 w-4" />
              ) : (
                <span className="text-xs font-bold">You</span>
              )}
            </div>
            <div
              className={cn(
                "max-w-[82%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "assistant"
                  ? "rounded-tl-sm bg-muted"
                  : "rounded-tr-sm bg-primary text-primary-foreground"
              )}
            >
              {msg.role === "assistant" ? (
                <>
                  <MarkdownMessage content={msg.content} />
                  {msg.sources && msg.sources.length > 0 && (
                    <SourceCitations sources={msg.sources} />
                  )}
                </>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground ring-1 ring-primary/20">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-background px-4 py-3">
        {limitReached ? (
          <p className="py-1 text-center text-sm text-destructive">
            Daily limit reached for your institute. Access resets tomorrow.
          </p>
        ) : (
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question… (Enter to send, Shift+Enter for newline)"
              disabled={loading}
              className="max-h-[120px] min-h-[40px] flex-1 resize-none"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              size="icon"
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          {tokensUsed.toLocaleString()} / {dailyLimit.toLocaleString()} tokens used today
        </p>
      </div>
    </div>
  );
}
