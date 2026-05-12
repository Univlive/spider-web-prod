import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@shared/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.32 }}
      className={className}
    >
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        {Icon ? (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60">
            <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2v6"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.24 7.76L13 15"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}

        {actionLabel && onAction && (
          <Button onClick={onAction} className="gradient-bg rounded-xl text-white">
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
