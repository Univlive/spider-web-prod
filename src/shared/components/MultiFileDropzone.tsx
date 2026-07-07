import { useRef, useState } from "react";
import { Camera, FileText, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@shared/ui/button";

const ACCEPTED = ".pdf,image/jpeg,image/png";

type Props = {
  onUpload: (files: File[]) => Promise<void>;
  busy?: boolean;
  label?: string;
  hint?: string;
  submitLabel?: (count: number) => string;
};

function isPdf(f: File) {
  return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
}

/**
 * Accepts either several page images OR a single PDF for the whole
 * document — mirrors grade-engine's upload endpoints exactly (one call,
 * `files` field, auto-numbered pages). Selecting one PDF and several
 * images at once is blocked client-side since the backend only treats a
 * single-file PDF selection as "split this into pages".
 *
 * Two capture paths: "Choose Files" (gallery/file picker, multi-select or a
 * single PDF, replaces the current selection) and "Take Photo" (device
 * camera via `capture="environment"` — mobile browsers open the camera
 * directly instead of a file chooser; one photo per tap, appended so a
 * teacher can shoot a multi-page answer sheet page by page).
 */
export default function MultiFileDropzone({ onUpload, busy, label, hint, submitLabel }: Props) {
  const [selected, setSelected] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function pick(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const hasPdf = files.some(isPdf);
    if (hasPdf && files.length > 1) {
      setSelected([files.find(isPdf)!]);
      return;
    }
    setSelected(files);
  }

  function captureAppend(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const captured = Array.from(fileList);
    setSelected((prev) => (prev.some(isPdf) ? captured : [...prev, ...captured]));
    if (cameraRef.current) cameraRef.current.value = "";
  }

  function removeAt(idx: number) {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    if (selected.length === 0) return;
    await onUpload(selected);
    setSelected([]);
    if (inputRef.current) inputRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => captureAppend(e.target.files)}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <UploadCloud className="h-6 w-6" />
          <span>{label || "Choose page images or a single PDF"}</span>
          {hint && <span className="text-xs">{hint}</span>}
        </button>
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={busy}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <Camera className="h-6 w-6" />
          <span>Take Photo</span>
          <span className="text-xs">One page at a time</span>
        </button>
      </div>

      {selected.length > 0 && (
        <div className="space-y-1.5">
          {selected.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2">
                {isPdf(f) ? (
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">{f.name}</span>
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button size="sm" className="w-full" onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel
              ? submitLabel(selected.length)
              : `Upload ${selected.length} file${selected.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
