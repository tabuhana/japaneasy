'use server'

import db from "@/drizzle"
import { UserProgress } from "@/drizzle/schema/userProgress"
import { getUser } from "./auth-actions"

export const createUserProgress = async () => {
  const user = await getUser()
  if (!user) {
    throw new Error('User is required')
  }

  try {

    await db.insert(UserProgress).values({
      userId: user.id,
    })
  } catch {
    throw new Error('Errorr creating userProgress')
  }
}
