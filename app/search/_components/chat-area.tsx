"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { SelectChat, SelectMessage, SelectSource } from "@/db/schema"
import { useState } from "react"
import { searchExaAction } from "@/actions/exa-actions"
import { generateOpenAIResponseAction } from "@/actions/openai-actions"
import { readStreamableValue } from "ai/rsc"
import { createChat } from "@/db/queries/chats-queries"
import { createMessageAction } from "@/actions/db/messages-actions"
import { createSourcesAction } from "@/actions/db/sources-actions"
interface ChatAreaProps {
  className?: string
  initialSources: SelectSource[]
  initialMessages: SelectMessage[]
  chatId?: string
  userId: string
}

export default function ChatArea({
  className,
  initialSources,
  initialMessages,
  chatId,
  userId
}: ChatAreaProps) {
  const [message, setMessage] = useState(initialMessages)
  const [sources, setSources] = useState(initialSources)
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [input, setInput] = useState("")

  const handleSearch = async (query: string) => {
    setIsSearching(true)

    let currentChatId = "temp-chat-id"
    let isNewChat = true

    const userMessageId = Date.now().toString()
    const assistantMessageId = Date.now().toString() + 1

    setMessage(prev => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: query,
        chatId: currentChatId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "Searching for information...",
        chatId: currentChatId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

    const exaResponse = await searchExaAction(query)

    console.log("exaResponse", exaResponse)

    if (!exaResponse.isSuccess) {
      console.error("Error searching for information:", exaResponse.message)
      setIsSearching(false)
      return
    }

    setSources(
      (exaResponse.data || []).map((result, idx) => ({
        id: `${idx}-${Date.now()}`,
        userId,
        chatId: currentChatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...result
      }))
    )

    setIsSearching(false)
    setIsGenerating(true)

    const openaiResponse = await generateOpenAIResponseAction(query, sources)
    if (!openaiResponse.isSuccess || !openaiResponse.data) {
      console.error("Error generating OpenAI response:", openaiResponse.message)
      setIsGenerating(false)
      return
    }

    setIsGenerating(false)

    let fullContent = ""
    try {
      for await (const chunk of readStreamableValue(openaiResponse.data)) {
        if (chunk) {
          fullContent += chunk
          setMessage(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: fullContent
                  }
                : msg
            )
          )
        }
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error)
    }

    if (isNewChat) {
      const newChat = await createChat({ userId, name: query.slice(0, 50) })
      if (newChat) {
        currentChatId = newChat.id || ""
        isNewChat = false
      } else {
        console.error("Error creating chat")
      }
    }

    const userMessageResult = await createMessageAction({
      chatId: currentChatId,
      content: query,
      role: "user",
      userId
    })

    const assistantMessageResult = await createMessageAction({
      chatId: currentChatId,
      content: fullContent,
      role: "assistant",
      userId
    })

    const sourcesResult = await createSourcesAction(
      exaResponse.data?.map(result => ({
        userId,
        chatId: currentChatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...result
      })) || []
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() && !isSearching) {
      handleSearch(input)
    }
  }

  return (
    <div className={cn("flex h-full flex-col items-center", className)}>
      {message.length === 0 ? (
        <div className="w-full max-w-3xl space-y-6 p-4">
          <h1 className="text-center text-4xl font-bold">Ask Anything</h1>

          <div className="relative">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any question..."
              className="pr-12"
            />
            <Button
              onClick={() => handleSearch(input)}
              disabled={isSearching || !input.trim()}
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
            >
              <Search className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-6 p-4 pt-8">
          {message.map(
            (msg, index) =>
              msg.role === "user" && (
                <div key={msg.id} className="text-xl font-medium">
                  {msg.content}
                </div>
              )
          )}

          <div className="flex gap-4 overflow-x-auto pb-2">
            {sources.map(source => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-32 w-64 flex-none flex-col justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <h3 className="line-clamp-2 text-sm font-medium">
                  {source.title}
                </h3>
                <p className="mt-2 truncate text-xs text-gray-500">
                  {source.url}
                </p>
              </a>
            ))}
          </div>

          {message.map(
            (msg, index) =>
              msg.role === "assistant" && (
                <div key={msg.id} className="prose max-w-none">
                  {msg.content}
                </div>
              )
          )}
        </div>
      )}
    </div>
  )
}
