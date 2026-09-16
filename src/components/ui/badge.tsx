import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-800",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60",
        destructive: "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80",
        outline: "text-slate-700 border border-slate-200 hover:bg-slate-50",
        emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
        amber: "bg-amber-50 text-amber-700 border border-amber-200/80",
        blue: "bg-blue-50 text-blue-700 border border-blue-200/80",
        purple: "bg-purple-50 text-purple-700 border border-purple-200/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
