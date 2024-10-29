"use server"

import { Suspense } from "react"
import Sidebar from "./_components/sidebar"
import SidebarSkeleton from "./_components/sidebar-skeleton"
import { getChatsAction } from "@/actions/db/chats-actions"
import { auth } from "@clerk/nextjs/server"

interface SearchLayoutProps {
  children: React.ReactNode
}

export default async function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div className="flex h-screen">
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarFetcher />
      </Suspense>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

async function SidebarFetcher() {
  const { userId } = auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }

  const { data: chats = [] } = await getChatsAction(userId)

  return <Sidebar className="w-80" initialChats={chats} userId={userId} />
}
