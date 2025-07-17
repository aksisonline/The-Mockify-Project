"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, Sparkles, ChevronRight, Loader2 } from "lucide-react"
import Image from "next/image"

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "👋 Hi there! I'm Mockify Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const quickQuestions = [
    "What services do you offer?",
    "How do I join the community?",
    "Tell me about Mockify tools",
    "How can I contact support?",
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true)
        setTimeout(() => {
          setShowTooltip(false)
        }, 10000)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return

    const newUserMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(
      () => {
        const botResponse = {
          id: messages.length + 2,
          type: "bot",
          content: getBotResponse(inputValue),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleQuickQuestion = (question) => {
    const newUserMessage = {
      id: messages.length + 1,
      type: "user",
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setIsTyping(true)

    setTimeout(
      () => {
        const botResponse = {
          id: messages.length + 2,
          type: "bot",
          content: getBotResponse(question),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const getBotResponse = (message) => {
    const lowerMsg = message.toLowerCase()

    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
      return "Hello there! How can I assist you with Mockify today?"
    } else if (lowerMsg.includes("service") || lowerMsg.includes("offer")) {
      return "We offer a variety of services including Mockify Tools, Community Forums, Marketplace (Kart), Professional Reviews, and Training Programs. Which one would you like to know more about?"
    } else if (lowerMsg.includes("tool")) {
      return "Our tools include VC Bar Simulator, Room Design Tools, Equipment Calculators, and more. These tools help professionals design and implement better systems. Would you like to explore our tools section?"
    } else if (lowerMsg.includes("join") || lowerMsg.includes("community") || lowerMsg.includes("sign up")) {
      return "Joining our community is easy! Click the 'Sign Up' button in the top navigation bar and follow the registration process. You'll get access to forums, resources, and networking opportunities with other professionals."
    } else if (lowerMsg.includes("contact") || lowerMsg.includes("support") || lowerMsg.includes("help")) {
      return `You can reach our support team at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL} or call us at +91 9966416417. Alternatively, you can fill out the contact form on our Contact page.`
    } else if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("fee")) {
      return "We offer various membership tiers starting from a free basic plan to premium plans with additional features. Would you like me to explain the different pricing options?"
    } else {
      return "I'm not sure I understand. Could you rephrase your question or select one of the quick options below?"
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg max-w-xs z-50"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Need help?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  I'm your Media Assistant. Click here to chat with me!
                </p>
                <Button
                  size="sm"
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setShowTooltip(false)
                    setIsOpen(true)
                  }}
                >
                  Start Chat
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 p-0 overflow-hidden"
            aria-label="Open chat"
          >
            <div className="relative w-full h-full">
              <Image src="/chatbot-icon.png" alt="Mockify Assistant" fill className="object-fill" sizes="56px" priority />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 w-full sm:w-96 max-w-[calc(100vw-48px)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700 flex flex-col"
            style={{ maxHeight: "calc(100vh - 80px)" }}
          >
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-white/20">
                    <AvatarImage src="/bot-avatar-fixed.png" alt="Mockify Assistant" />
                    <AvatarFallback className="bg-blue-600">M</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Mockify Assistant</h3>
                  <p className="text-xs text-blue-100">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-end space-x-2 max-w-[80%]">
                    {message.type === "bot" && (
                      <Avatar className="h-8 w-8 mb-1">
                        <AvatarImage src="/bot-avatar-fixed.png" alt="Mockify Assistant" />
                        <AvatarFallback className="bg-blue-600">M</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`p-3 rounded-2xl ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className={message.type === "user" ? "text-white" : "text-gray-800 dark:text-gray-200"}>
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          message.type === "user" ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <Avatar className="h-8 w-8 mb-1">
                      <AvatarImage src="/bot-avatar-fixed.png" alt="Mockify Assistant" />
                      <AvatarFallback className="bg-blue-600">M</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length < 3 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested questions:</p>
                <div className="grid grid-cols-1 gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-left text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex justify-between items-center transition-colors"
                    >
                      <span>{question}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={inputValue.trim() === "" || isTyping}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label="Send message"
                >
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                Powered by Mockify AI Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
