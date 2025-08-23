"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send } from "lucide-react"

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: "you" | "opponent" }>>([
    { id: 1, text: "Good luck!", sender: "opponent" },
    { id: 2, text: "Thanks, you too!", sender: "you" },
  ])

  const sendMessage = () => {
    if (message.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: message,
          sender: "you",
        },
      ])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 bg-black hover:bg-gray-800 text-white shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 h-96 bg-white/95 backdrop-blur-sm border shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm">Chat</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col h-full p-0">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                      msg.sender === "you" ? "bg-black text-white" : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
