"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ChatAreaSkeletonProps {
  className?: string
}

export default function ChatAreaSkeleton({ className }: ChatAreaSkeletonProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center",
        className
      )}
    >
      <div className="w-full max-w-3xl space-y-6 p-4">
        <Skeleton className="mx-auto h-12 w-48" />

        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
