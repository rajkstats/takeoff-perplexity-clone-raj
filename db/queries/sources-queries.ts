"use server"

import { db } from "@/db/db"
import { sourcesTable } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export const createSource = async (
  chatId: string,
  url: string,
  title: string,
  userId: string,
  summary: string,
  text: string
) => {
  try {
    const [newSource] = await db
      .insert(sourcesTable)
      .values({ chatId, url, title, userId, summary, text })
      .returning()
    return newSource
  } catch (error) {
    console.error("Error creating source:", error)
    throw new Error("Failed to create source")
  }
}

export const getSources = async (chatId: string, userId: string) => {
  try {
    return await db.query.sourcesTable.findMany({
      where: and(
        eq(sourcesTable.chatId, chatId),
        eq(sourcesTable.userId, userId)
      )
    })
  } catch (error) {
    console.error("Error getting sources:", error)
    throw new Error("Failed to get sources")
  }
}
