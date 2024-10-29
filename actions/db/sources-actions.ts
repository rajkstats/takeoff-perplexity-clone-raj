"use server"

import { getSources, createSource } from "@/db/queries/sources-queries"
import { ActionState } from "@/types"
import { InsertSource, SelectSource } from "@/db/schema"
import { revalidatePath } from "next/cache"


export async function createSourcesAction(
  sources: InsertSource[]
): Promise<ActionState<SelectSource[]>> {
  try {
    const newSources = await Promise.all(
      sources.map(source => 
        createSource(
          source.chatId,
          source.url,
          source.title,
          source.userId,
          source.text,
          source.summary
        )
      )
    )
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Sources created successfully",
      data: newSources
    }
  } catch (error) {
    console.error("Error creating sources:", error)
    return { isSuccess: false, message: "Failed to create sources" }
  }
}

export async function getSourcesAction(
  chatId: string,
  userId: string
): Promise<ActionState<SelectSource[]>> {
  try {
    const sources = await getSources(chatId, userId)
    return {
      isSuccess: true,
      message: "Sources retrieved successfully",
      data: sources
    }
  } catch (error) {
    console.error("Error getting sources:", error)
    return { isSuccess: false, message: "Failed to get sources" }
  }
} 