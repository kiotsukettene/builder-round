import { Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PrescriptionBadgeProps {
  count: number;
  className?: string;
}

function getPrescriptionLabel(count: number): string {
  if (count === 1) return "1 prescription";
  return `${count} prescriptions`;
}

export function PrescriptionBadge({ count, className }: PrescriptionBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800",
        "dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
        className,
      )}
    >
      <Pill className="size-3.5 shrink-0" />
      {getPrescriptionLabel(count)}
    </Badge>
  );
}
