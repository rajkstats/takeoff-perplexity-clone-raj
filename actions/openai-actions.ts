"use server"

import { ActionState } from "@/types";
import { SelectSource } from "@/db/schema";
import { streamText }  from "ai";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { openai } from "@ai-sdk/openai";

export async function generateOpenAIResponseAction(
    userQuery: string, 
    sources: SelectSource[]
): Promise<ActionState<StreamableValue<any, any>>> {
    try {
        const stream = createStreamableValue()

        const sourcesContext = sources.map(
            (r,i) => 
                `Source ${i + 1}: ${r.title}\nURL: ${r.url}\nSummary: ${r.summary}\nText: ${r.text}`
        ).join("\n")

        const systemPrompt = `You are a helpful assistant. Use the following sources to answer the user's query. If the sources don't contain relevant information, you can use your general knowledge to answer.

        Today's date is ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
        
        Sources:
        ${sourcesContext}
        
        Always cite your sources when using information from them. If you use general knowledge, state that it's based on your general understanding.
        
        Respond in markdown format.`

    ;( async () => {
        const {textStream} = await streamText({
            model:openai("gpt-4o-mini"),
            system: systemPrompt,
            messages: [
                {role: "user", content: userQuery}
            ]
        })

        for await (const text of textStream) { 
            stream.update(text)
        }

        stream.done()
    })()

    return {
        isSuccess: true,
        message: "Successfully generated response",
        data: stream.value
    }
    } catch (error) {
        console.error("Error generating OpenAI response:", error)
        return { isSuccess: false, message: "Failed to generate OpenAI response" }
    }
}