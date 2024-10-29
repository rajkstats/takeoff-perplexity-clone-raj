"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface SidebarSkeletonProps {
  className?: string
}

export default function SidebarSkeleton({ className }: SidebarSkeletonProps) {
  return (
    <div className={cn("border-border bg-muted/50 border-r", className)}>
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[80vh] w-full" />
      </div>
    </div>
  )
}
