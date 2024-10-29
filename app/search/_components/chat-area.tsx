"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, MessageSquare, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SelectChat, SelectMessage, SelectSource } from "@/db/schema"
import { useState } from "react"
import { searchExaAction } from "@/actions/exa-actions"
import { generateOpenAIResponseAction } from "@/actions/openai-actions"
import { readStreamableValue } from "ai/rsc"
import { createChat } from "@/db/queries/chats-queries"
import { createMessageAction } from "@/actions/db/messages-actions"
import { createSourcesAction } from "@/actions/db/sources-actions"
import ReactMarkdown from "react-markdown"

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
    <div
      className={cn("flex h-full flex-col items-center text-white", className)}
    >
      {message.length === 0 ? (
        <div className="flex size-full max-w-3xl flex-col items-center justify-center p-4">
          <div className="w-full space-y-6">
            <h1 className="text-center text-4xl font-bold">Ask Anything</h1>

            <div className="relative">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any question..."
                className="border-gray-800 bg-gray-900 pr-12 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={() => handleSearch(input)}
                disabled={isSearching || !input.trim()}
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2 bg-white text-gray-900 hover:bg-gray-200"
              >
                <Search className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-6 p-4 pt-8">
          {message.map(
            (msg, index) =>
              msg.role === "user" && (
                <div key={msg.id} className="text-xl font-medium text-white">
                  {msg.content}
                </div>
              )
          )}

          {message.map(
            (msg, index) =>
              msg.role === "assistant" && (
                <div key={msg.id} className="space-y-6">
                  <div>
                    <div className="mb-4 flex items-center gap-2 text-base text-gray-400">
                      {isSearching ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Search className="size-5" />
                      )}
                      <span className="font-medium">
                        {isSearching ? "Searching sources..." : "Sources"}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-4">
                        <div className="flex flex-nowrap">
                          {sources.map(source => (
                            <a
                              key={source.id}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-[300px] flex-none flex-col gap-1 rounded-lg border border-gray-800 bg-gray-900/50 p-3 text-sm transition-colors hover:bg-gray-800/50"
                            >
                              <div className="line-clamp-2 font-medium text-white">
                                {source.title}
                              </div>
                              <div className="truncate text-xs text-gray-400">
                                {source.url}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 text-base text-gray-400">
                      {isGenerating ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <MessageSquare className="size-5" />
                      )}
                      <span className="font-medium">
                        {isGenerating ? "Generating answer..." : "Answer"}
                      </span>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="mb-4 text-2xl font-bold">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="mb-3 text-xl font-bold">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mb-2 text-lg font-bold">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-4">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-4 list-disc pl-6">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-4 list-decimal pl-6">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-gray-800 px-1">
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-700 pl-4 italic">
                              {children}
                            </blockquote>
                          )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  )
}
