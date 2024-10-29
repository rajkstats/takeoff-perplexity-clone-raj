"use server"

import { Suspense } from "react"
import ChatArea from "../_components/chat-area"
import ChatAreaSkeleton from "../_components/chat-area-skeleton"
import { getMessagesAction } from "@/actions/db/messages-actions"
import { getSourcesAction } from "@/actions/db/sources-actions"
import { auth } from "@clerk/nextjs/server"

interface ChatPageProps {
  params: {
    chatId: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  return (
    <Suspense fallback={<ChatAreaSkeleton />}>
      <ChatFetcher chatId={params.chatId} userId={userId} />
    </Suspense>
  )
}

async function ChatFetcher({
  chatId,
  userId
}: {
  chatId: string
  userId: string
}) {
  const [{ data: messages = [] }, { data: sources = [] }] = await Promise.all([
    getMessagesAction(chatId, userId),
    getSourcesAction(chatId, userId)
  ])

  return (
    <ChatArea
      initialMessages={messages}
      initialSources={sources}
      chatId={chatId}
      userId={userId}
    />
  )
}
