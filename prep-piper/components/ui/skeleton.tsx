// Minimal skeleton utility for loading states
import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-foreground/10", className)} />
}
