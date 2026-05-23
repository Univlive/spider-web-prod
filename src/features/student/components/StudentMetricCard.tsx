import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@shared/ui/card";
import { cn } from "@shared/lib/utils";

interface StudentMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "mint" | "yellow" | "lavender" | "peach" | "pink";
  className?: string;
}

const colorClasses = {
  mint: "bg-pastel-mint",
  yellow: "bg-pastel-yellow",
  lavender: "bg-pastel-lavender",
  peach: "bg-pastel-peach",
  pink: "bg-pastel-pink",
};

export function StudentMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "mint",
  className,
}: StudentMetricCardProps) {
  return (
    <Card className={cn("card-soft card-hover border-0", colorClasses[color], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-500"
                )}
              >
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
