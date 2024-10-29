"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { SelectChat, SelectMessage, SelectSource } from "@/db/schema"

interface ChatAreaProps {
  className?: string
  initialSources: SelectSource[]
  initialMessages: SelectMessage[]
  chatId?: string
  userId: string
}

export default function ChatArea({
  className,
  initialSources,
  initialMessages,
  chatId,
  userId
}: ChatAreaProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center",
        className
      )}
    >
      <div className="w-full max-w-3xl space-y-6 p-4">
        <h1 className="text-center text-4xl font-bold">Ask Anything</h1>

        <div className="relative">
          <Input placeholder="Ask any question..." className="pr-12" />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
