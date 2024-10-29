"use server"

import { ActionState } from "@/types"
import Exa  from "exa-js"

const exa = new Exa(process.env.EXA_API_KEY)

export async function searchExaAction(userQuery: string): Promise<ActionState<{
    title: string,
    url: string,
    text: string,
    summary: string
} []>> {
    try {
        const exaResponse = await exa.searchAndContents(userQuery, {
            type: "neural",
            useAutoprompt: true,
            numResults: 5,
            text: true,
            livecrawl: "always",
            summary: true
        })

        const formattedResults = exaResponse.results.map((result) => ({
            title: result.title || "Untitled",
            url: result.url ,
            text: result.text,
            summary: result.summary
        }))

        return {
            isSuccess: true,
            message: "Search results retrieved successfully",
            data: formattedResults
        }
    } catch (error) {
        console.error("Error searching Exa:", error)
        return { isSuccess: false, message: "Failed to search Exa" }
    }
}