"use server"

import { db } from "@/db/db"
import { messagesTable } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export const createMessage = async (
  chatId: string,
  content: string,
  role: "assistant" | "user",
  userId: string
) => {
  try {
    const [newMessage] = await db
      .insert(messagesTable)
      .values({ chatId, content, role, userId })
      .returning()
    return newMessage
  } catch (error) {
    console.error("Error creating message:", error)
    throw new Error("Failed to create message")
  }
}

export const getMessages = async (chatId: string, userId: string) => {
  try {
    return await db
      .select()
      .from(messagesTable)
      .where(
        and(eq(messagesTable.chatId, chatId), eq(messagesTable.userId, userId))
      )
  } catch (error) {
    console.error("Error getting messages:", error)
    throw new Error("Failed to get messages")
  }
}
