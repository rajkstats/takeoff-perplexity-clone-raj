"use server"

import ChatArea from "./_components/chat-area"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
export default async function SearchPage() {
  const { userId } = auth()

  if (!userId) {
    return redirect("/login")
  }

  return <ChatArea initialSources={[]} initialMessages={[]} userId={userId} />
}
