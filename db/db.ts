import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Create a connection pool with specific limits
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, {
  max: 1, // Set max pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30 // Connection lifetime of 30 minutes
})

export const db = drizzle(client, { schema })
