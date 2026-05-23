import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@shared/ui/input";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@shared/lib/utils";

interface SearchableSingleSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSingleSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
}: SearchableSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, search]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-10 cursor-pointer items-center justify-between rounded-md border bg-background px-3 py-2 text-sm transition-colors",
          disabled ? "cursor-not-allowed opacity-50" : "hover:border-muted-foreground/40",
          open && !disabled ? "border-primary ring-1 ring-ring" : ""
        )}
        onClick={() => {
          if (disabled) return;
          setOpen(!open);
          setTimeout(() => searchRef.current?.focus(), 50);
        }}
      >
        <span className={value ? "" : "text-muted-foreground"}>{value || placeholder}</span>
        <div className="flex items-center gap-1">
          {value && (
            <X
              className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setOpen(false);
              }}
            />
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="border-b p-2">
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {search ? "No matches" : "No options available"}
              </p>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt === value;
                return (
                  <div
                    key={opt}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                      isSelected && "bg-primary/5 text-primary"
                    )}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <span>{opt}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
