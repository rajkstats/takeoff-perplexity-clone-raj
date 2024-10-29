"use server"

import { createProfile } from "@/db/queries/profiles-queries"
import { SelectProfile } from "@/db/schema"
import { ActionState } from "@/types"

export async function createProfileAction(
  userId: string
): Promise<ActionState<SelectProfile | undefined>> {
  try {
    const newProfile = await createProfile({
      userId,
      membership: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    if (!newProfile) {
      return {
        isSuccess: false,
        message: "Failed to create profile"
      }
    }

    return {
      isSuccess: true,
      message: "Profile created successfully",
      data: newProfile
    }
  } catch (error) {
    console.error("Error creating profile", error)
    return {
      isSuccess: false,
      message: "Failed to create profile"
    }
  }
}
