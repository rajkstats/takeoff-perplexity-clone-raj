"use server"

import { db } from "@/db/db"
import { InsertChat, chatsTable } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export const createChat = async (data: InsertChat) => {
  try {
    const [newChat] = await db.insert(chatsTable).values(data).returning()
    return newChat
  } catch (error) {
    console.error("Error creating chat:", error)
    throw new Error("Failed to create chat")
  }
}

export const getChats = async (userId: string) => {
  try {
    const chats = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.userId, userId))
      .orderBy(desc(chatsTable.createdAt))
    return chats
  } catch (error) {
    console.error("Error getting chats:", error)
    throw new Error("Failed to get chats")
  }
}

export const deleteChat = async (chatId: string) => {
  try {
    await db.delete(chatsTable).where(eq(chatsTable.id, chatId))
  } catch (error) {
    console.error("Error deleting chat:", error)
    throw new Error("Failed to delete chat")
  }
}
