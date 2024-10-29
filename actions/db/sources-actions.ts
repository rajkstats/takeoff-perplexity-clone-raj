"use server"

import { getSources } from "@/db/queries/sources-queries"
import { SelectSource } from "@/db/schema"
import { ActionState } from "@/types"

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