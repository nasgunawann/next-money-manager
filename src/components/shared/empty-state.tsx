import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import {
  IconReceipt,
  IconWallet,
  IconSearch,
  IconChartPie,
  IconList,
} from "@tabler/icons-react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
  hint?: string;
  variant?: "default" | "filtered" | "warning";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  hint,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "text-center py-12 md:py-16 bg-card rounded-xl border border-dashed transition-colors",
        variant === "default" && "border-border",
        variant === "filtered" && "border-border bg-muted/20",
        variant === "warning" &&
          "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20",
        className
      )}
    >
      {/* Icon Container */}
      <div className="relative inline-flex mb-6 animate-in fade-in zoom-in duration-500">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="gap-2"
              size="default"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="default"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Hint */}
      {hint && <p className="text-xs text-muted-foreground/70 mt-4">{hint}</p>}
    </div>
  );
}

// Icon compositions for common empty states
export function EmptyTransactionsIcon() {
  return (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-xl" />
      <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <IconReceipt className="w-10 h-10 text-primary" stroke={1.5} />
      </div>
    </div>
  );
}

export function EmptyAccountsIcon() {
  return (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-xl" />
      <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <IconWallet className="w-10 h-10 text-primary" stroke={1.5} />
      </div>
    </div>
  );
}

export function EmptySearchIcon() {
  return (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-xl" />
      <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <IconSearch className="w-10 h-10 text-primary" stroke={1.5} />
      </div>
    </div>
  );
}

export function EmptyReportsIcon() {
  return (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 rounded-full blur-xl" />
      <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <IconChartPie className="w-10 h-10 text-primary" stroke={1.5} />
      </div>
    </div>
  );
}

export function EmptyListIcon() {
  return (
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 bg-muted/50 rounded-full blur-lg" />
      <div className="relative w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <IconList className="w-8 h-8 text-muted-foreground/50" stroke={1.5} />
      </div>
    </div>
  );
}
