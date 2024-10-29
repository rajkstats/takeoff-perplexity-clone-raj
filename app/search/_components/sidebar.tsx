"use client"

import { SelectChat } from "@/db/schema"
import { createChatAction } from "@/actions/db/chats-actions"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { deleteChatAction } from "@/actions/db/chats-actions"

interface SidebarProps {
  className?: string
  initialChats: SelectChat[]
  userId: string | null
}

export default function Sidebar({
  className,
  initialChats = [],
  userId
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname() || ""
  const { user } = useUser()

  const handleNewChat = async () => {
    if (!user) return
    try {
      const result = await createChatAction(user.id, "New Chat")

      if (result.isSuccess && result.data) {
        router.push(`/search/${result.data.id}`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const result = await deleteChatAction(chatId)
      if (result.isSuccess) {
        router.refresh()
        if (pathname.includes(chatId)) {
          router.push("/search")
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error)
    }
  }

  return (
    <div className={cn("flex h-full flex-col border-r p-4", className)}>
      <Button
        onClick={handleNewChat}
        className="mb-4 flex w-full items-center gap-2 bg-neutral-800 hover:bg-neutral-700"
        variant="secondary"
      >
        <Plus size={16} />
        New Search
      </Button>

      <div className="mb-4 text-center">
        <h2 className="font-bold text-neutral-400">Chat History</h2>
      </div>

      <div className="space-y-2">
        {Array.isArray(initialChats) &&
          initialChats.map(chat => {
            const isActive = pathname.startsWith(`/search/${chat.id}`)
            return (
              <Link
                key={chat.id}
                href={`/search/${chat.id}`}
                className={cn(
                  "group flex w-full cursor-pointer items-center justify-between truncate rounded-lg px-4 py-2 transition-colors",
                  isActive ? "bg-neutral-800" : "hover:bg-neutral-800/50"
                )}
              >
                <span className="truncate">{chat.name}</span>
                <Trash2
                  size={16}
                  className="text-neutral-400 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                  onClick={e => handleDeleteChat(chat.id, e)}
                />
              </Link>
            )
          })}
      </div>
    </div>
  )
}
