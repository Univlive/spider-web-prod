import { useEffect, useState } from "react";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Checkbox } from "@shared/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/card";
import { Label } from "@shared/ui/label";
import { ScrollArea } from "@shared/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/ui/select";
import { Textarea } from "@shared/ui/textarea";
import {
  formatNegativeMarksDisplay,
  type AiImportPreviewItem,
  type AiImportSummary,
} from "@shared/lib/aiQuestionImport";
import { HtmlView } from "@shared/lib/safeHtml";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileSearch,
  Loader2,
  Pencil,
  Plus,
  X,
} from "lucide-react";

function statusTone(status: AiImportPreviewItem["status"]) {
  if (status === "ready") return "default" as const;
  if (status === "partial") return "secondary" as const;
  return "destructive" as const;
}

const FILTERABLE_STATUSES: Array<AiImportPreviewItem["status"]> = ["ready", "partial", "rejected"];

function deriveActiveStatusesFromIncluded(items: AiImportPreviewItem[]) {
  return FILTERABLE_STATUSES.filter((status) =>
    items.some((item) => item.status === status && item.include)
  );
}

type Props = {
  open: boolean;
  fileName: string;
  summary: AiImportSummary | null;
  items: AiImportPreviewItem[];
  importing: boolean;
  saving: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onItemIncludeChange: (sourceIndex: number, include: boolean) => void;
  onItemEdit: (
    sourceIndex: number,
    patch: Partial<Pick<AiImportPreviewItem, "question" | "options" | "correctOption">>
  ) => void;
  onSelectAll: () => void;
  onSelectOnlyReady: () => void;
  onSelectOnlyPartial: () => void;
  onSelectOnlyRejected: () => void;
  onSaveSelected: () => void;
};

export default function AiQuestionImportOverlay({
  open,
  fileName,
  summary,
  items,
  importing,
  saving,
  onClose,
  onCancel,
  onItemIncludeChange,
  onItemEdit,
  onSelectAll,
  onSelectOnlyReady,
  onSelectOnlyPartial,
  onSelectOnlyRejected,
  onSaveSelected,
}: Props) {
  const [editingItems, setEditingItems] = useState<number[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<Array<AiImportPreviewItem["status"]>>(() =>
    deriveActiveStatusesFromIncluded(items)
  );

  useEffect(() => {
    setActiveStatuses(deriveActiveStatusesFromIncluded(items));
  }, [items]);

  if (!open) return null;

  const selectedCount = items.filter((item) => item.include).length;
  const readyCount = summary?.ready ?? items.filter((item) => item.status === "ready").length;
  const partialCount = summary?.partial ?? items.filter((item) => item.status === "partial").length;
  const rejectedCount =
    summary?.rejected ?? items.filter((item) => item.status === "rejected").length;
  const acceptedCount = readyCount + partialCount;
  const allActive = activeStatuses.length === FILTERABLE_STATUSES.length;

  function toggleItemEdit(sourceIndex: number) {
    setEditingItems((prev) =>
      prev.includes(sourceIndex) ? prev.filter((id) => id !== sourceIndex) : [...prev, sourceIndex]
    );
  }

  function applyStatusSelection(nextStatuses: Array<AiImportPreviewItem["status"]>) {
    const nextSet = new Set(nextStatuses);
    items.forEach((item) => {
      onItemIncludeChange(item.sourceIndex, nextSet.has(item.status));
    });
    setActiveStatuses(nextStatuses);
  }

  function activateAllFilters() {
    applyStatusSelection(FILTERABLE_STATUSES);
  }

  function toggleStatusFilter(status: AiImportPreviewItem["status"]) {
    const prevSet = new Set(activeStatuses);

    // When "All" is active, clicking a status deselects just that one.
    if (prevSet.size === FILTERABLE_STATUSES.length) {
      prevSet.delete(status);
      applyStatusSelection(Array.from(prevSet));
      return;
    }

    if (prevSet.has(status)) {
      prevSet.delete(status);
    } else {
      prevSet.add(status);
    }

    applyStatusSelection(Array.from(prevSet));
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            <h3 className="truncate text-lg font-semibold">AI PDF Import Preview</h3>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {fileName || "Uploaded PDF"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {importing ? (
            <>
              <Button variant="outline" className="rounded-xl" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing PDF...
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" className="rounded-xl" onClick={onClose} disabled={saving}>
                <X className="mr-2 h-4 w-4" /> Close
              </Button>
              <Button
                className="rounded-xl"
                onClick={onSaveSelected}
                disabled={saving || selectedCount === 0}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Selected ({selectedCount})
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4 border-r bg-muted/20 p-5">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Import Summary</CardTitle>
                {importing && items.length > 0 && (
                  <Badge variant="secondary" className="animate-pulse text-xs">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Processing...
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {importing && items.length === 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Extracting and analyzing PDF...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border bg-blue-50 p-3 dark:bg-blue-950/20">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {summary?.total ?? items.length}
                        {importing && <span className="ml-1 text-xs">+</span>}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-green-50 p-3 dark:bg-green-950/20">
                      <p className="text-xs text-muted-foreground">Ready</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                        {summary?.ready ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-yellow-50 p-3 dark:bg-yellow-950/20">
                      <p className="text-xs text-muted-foreground">Partial</p>
                      <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                        {summary?.partial ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-red-50 p-3 dark:bg-red-950/20">
                      <p className="text-xs text-muted-foreground">Rejected</p>
                      <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                        {summary?.rejected ?? 0}
                      </p>
                    </div>
                  </div>

                  {!importing && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4" />
                        <div>
                          <p className="font-medium">How partial questions are saved</p>
                          <p className="mt-1 text-xs">
                            Any non-ready question (partial, incomplete, or rejected by AI) can be
                            kept and will be saved as an inactive review draft so students do not
                            see it until you fix it.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="min-h-0">
          <div className="space-y-4 p-5">
            {!importing && items.length > 0 && (
              <Card className="sticky top-0 z-10 rounded-2xl bg-background/95 backdrop-blur-sm">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="secondary" className="rounded-full">
                      Accepted: {acceptedCount}
                    </Badge>
                    <Badge variant="default" className="rounded-full">
                      Complete: {readyCount}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      Partial: {partialCount}
                    </Badge>
                    <Badge variant="destructive" className="rounded-full">
                      Rejected: {rejectedCount}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      Selected: {selectedCount}
                    </Badge>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Question Preview Filter
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className={`rounded-full px-3 ${allActive ? "bg-foreground text-background" : ""}`}
                        variant={allActive ? "default" : "outline"}
                        onClick={activateAllFilters}
                      >
                        {allActive ? <Check className="mr-1 h-3.5 w-3.5" /> : null}
                        All
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className={`rounded-full px-3 ${activeStatuses.includes("ready") ? "bg-green-600 text-white hover:bg-green-600" : ""}`}
                        variant={activeStatuses.includes("ready") ? "default" : "outline"}
                        onClick={() => toggleStatusFilter("ready")}
                      >
                        {activeStatuses.includes("ready") ? (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        ) : null}
                        Complete
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className={`rounded-full px-3 ${activeStatuses.includes("partial") ? "bg-amber-500 text-white hover:bg-amber-500" : ""}`}
                        variant={activeStatuses.includes("partial") ? "default" : "outline"}
                        onClick={() => toggleStatusFilter("partial")}
                      >
                        {activeStatuses.includes("partial") ? (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        ) : null}
                        Partial
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className={`rounded-full px-3 ${activeStatuses.includes("rejected") ? "bg-red-600 text-white hover:bg-red-600" : ""}`}
                        variant={activeStatuses.includes("rejected") ? "default" : "outline"}
                        onClick={() => toggleStatusFilter("rejected")}
                      >
                        {activeStatuses.includes("rejected") ? (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        ) : null}
                        Rejected
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                No questions were found in this PDF.
              </div>
            ) : (
              items.map((item) => {
                const options = Array.isArray(item.options) ? item.options : [];
                const correctOptionValue =
                  typeof item.correctOption === "number" && item.correctOption >= 0
                    ? String(item.correctOption)
                    : "none";
                const isEditing = editingItems.includes(item.sourceIndex);

                return (
                  <Card key={item.sourceIndex} className="rounded-2xl">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base">Question {item.sourceIndex}</CardTitle>
                            <Badge
                              variant={statusTone(item.status)}
                              className="rounded-full capitalize"
                            >
                              {item.status}
                            </Badge>
                            {item.status === "ready" ? (
                              <Badge variant="outline" className="rounded-full">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Active on save
                              </Badge>
                            ) : null}
                          </div>
                          <div className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                            <HtmlView
                              html={
                                item.question || "Question text could not be extracted clearly."
                              }
                              className="break-words text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => toggleItemEdit(item.sourceIndex)}
                            disabled={saving}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />{" "}
                            {isEditing ? "Close Edit" : "Edit"}
                          </Button>
                          <Checkbox
                            checked={item.include}
                            disabled={saving}
                            onCheckedChange={(checked) =>
                              onItemIncludeChange(item.sourceIndex, checked === true)
                            }
                          />
                          <span className="text-sm text-muted-foreground">Keep</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      {isEditing ? (
                        <div className="space-y-3 rounded-xl border bg-muted/15 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Edit Before Save
                            </p>
                            {item.manualEdited ? (
                              <Badge variant="secondary" className="rounded-full text-[10px]">
                                Edited
                              </Badge>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Question</Label>
                            <Textarea
                              value={item.question || ""}
                              onChange={(e) =>
                                onItemEdit(item.sourceIndex, { question: e.target.value })
                              }
                              className="min-h-[90px]"
                              placeholder="Edit extracted question text"
                              disabled={saving}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Options</Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 rounded-lg px-2"
                                  onClick={() =>
                                    onItemEdit(item.sourceIndex, { options: [...options, ""] })
                                  }
                                  disabled={saving || options.length >= 6}
                                >
                                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 rounded-lg px-2"
                                  onClick={() => {
                                    if (options.length <= 2) return;
                                    const nextOptions = options.slice(0, -1);
                                    let nextCorrect = item.correctOption;
                                    if (
                                      typeof nextCorrect === "number" &&
                                      nextCorrect >= nextOptions.length
                                    ) {
                                      nextCorrect = nextOptions.length
                                        ? nextOptions.length - 1
                                        : null;
                                    }
                                    onItemEdit(item.sourceIndex, {
                                      options: nextOptions,
                                      correctOption: nextCorrect,
                                    });
                                  }}
                                  disabled={saving || options.length <= 2}
                                >
                                  Remove Last
                                </Button>
                              </div>
                            </div>

                            {options.map((option, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="mt-2 w-5 text-xs font-semibold text-muted-foreground">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                <Textarea
                                  value={option || ""}
                                  onChange={(e) => {
                                    const nextOptions = [...options];
                                    nextOptions[index] = e.target.value;
                                    onItemEdit(item.sourceIndex, { options: nextOptions });
                                  }}
                                  className="min-h-[72px]"
                                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  disabled={saving}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Correct Option</Label>
                            <Select
                              value={correctOptionValue}
                              onValueChange={(value) =>
                                onItemEdit(item.sourceIndex, {
                                  correctOption: value === "none" ? null : Number(value),
                                })
                              }
                              disabled={saving}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select correct option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Not set</SelectItem>
                                {options.map((_, index) => (
                                  <SelectItem key={index} value={String(index)}>
                                    {`Choice ${String.fromCharCode(65 + index)}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : null}

                      <div className="grid gap-2">
                        {(item.options || []).length > 0 ? (
                          item.options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 rounded-xl border px-3 py-2"
                            >
                              <span className="font-medium text-muted-foreground">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <div className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                                <HtmlView html={option || "—"} className="break-words text-sm" />
                              </div>
                              {item.correctOption === index ? (
                                <Badge className="shrink-0 rounded-full">Correct</Badge>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed px-3 py-2 text-muted-foreground">
                            Options could not be extracted.
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="rounded-full">
                          Marks: +{item.marks}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          Negative: {formatNegativeMarksDisplay(item.negativeMarks)}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          Correct Option:{" "}
                          {typeof item.correctOption === "number"
                            ? String.fromCharCode(65 + item.correctOption)
                            : "Not found"}
                        </Badge>
                      </div>

                      {item.reasons?.length ? (
                        <div className="rounded-xl border border-dashed bg-muted/20 p-3">
                          <p className="mb-2 font-medium">Report</p>
                          <ul className="space-y-1 text-muted-foreground">
                            {item.reasons.map((reason, index) => (
                              <li key={index}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
