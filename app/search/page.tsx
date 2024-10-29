"use server"

import ChatArea from "./_components/chat-area"
import { auth } from "@clerk/nextjs/server"

export default async function SearchPage() {
  const { userId } = auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  return <ChatArea initialSources={[]} initialMessages={[]} userId={userId} />
}
