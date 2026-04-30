"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Car, Check, CheckCheck, Loader2, MessageCircle, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { fetchWithAuth } from "@/lib/api"

type Conversation = {
  id: number
  vehicle_id: number
  buyer_id: number
  seller_id: number
  marca?: string
  modelo?: string
  precio?: number
  imagen?: string | null
  estado?: string
  buyer_first_name?: string | null
  buyer_last_name?: string | null
  buyer_email?: string | null
  seller_first_name?: string | null
  seller_last_name?: string | null
  seller_email?: string | null
  seller_phone?: string | null
  last_message?: string | null
  last_sender_id?: number | null
  last_status?: "sent" | "read" | null
  last_message_at?: string | null
  unread_count: number
}

type ChatMessage = {
  id: number
  conversation_id: number
  sender_id: number
  body: string
  status: "sent" | "read"
  read_at?: string | null
  creado_en: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getStoredUserId() {
  if (typeof window === "undefined") return null

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null")
    return user?.id ? Number(user.id) : null
  } catch {
    return null
  }
}

function getOtherPerson(conversation: Conversation, userId: number | null) {
  const isSeller = userId === Number(conversation.seller_id)
  const firstName = isSeller ? conversation.buyer_first_name : conversation.seller_first_name
  const lastName = isSeller ? conversation.buyer_last_name : conversation.seller_last_name
  const email = isSeller ? conversation.buyer_email : conversation.seller_email
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()

  return fullName || email || "Contacto Cali Motors"
}

function formatTime(value?: string | null) {
  if (!value) return ""
  return new Intl.DateTimeFormat("es-CO", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function ChatsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<number | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) || null,
    [activeId, conversations]
  )

  const unreadTotal = useMemo(
    () => conversations.reduce((total, conversation) => total + Number(conversation.unread_count || 0), 0),
    [conversations]
  )

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/conversations`)
      if (!response.ok) throw new Error("No se pudieron cargar tus chats")
      const data: Conversation[] = await response.json()
      setConversations(data)

      const queryId = new URLSearchParams(window.location.search).get("conversationId")
      const selected = queryId ? Number(queryId) : data[0]?.id
      if (selected) setActiveId(selected)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tus chats")
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: number) => {
    setLoadingMessages(true)
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${conversationId}/messages`)
      if (!response.ok) throw new Error("No se pudo abrir el chat")
      const data: { messages: ChatMessage[] } = await response.json()
      setMessages(data.messages)
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, unread_count: 0 } : conversation
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar mensajes")
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    setUserId(getStoredUserId())
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (activeId) loadMessages(activeId)
  }, [activeId, loadMessages])

  useEffect(() => {
    const timer = window.setInterval(loadConversations, 15000)
    return () => window.clearInterval(timer)
  }, [loadConversations])

  useEffect(() => {
    if (!activeId) return

    const timer = window.setInterval(() => loadMessages(activeId), 10000)
    return () => window.clearInterval(timer)
  }, [activeId, loadMessages])

  const sendMessage = async () => {
    if (!activeId || !draft.trim()) return

    setSending(true)
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      })

      if (!response.ok) throw new Error("No se pudo enviar el mensaje")

      const data: { message: ChatMessage } = await response.json()
      setMessages((current) => [...current, data.message])
      setDraft("")
      await loadConversations()
      setActiveId(activeId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar mensaje")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_46%,#f8fafc_100%)] text-slate-900 dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_46%,#0f172a_100%)] dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Button asChild variant="ghost" className="rounded-2xl">
            <Link href="/protected">
              <ArrowLeft className="h-4 w-4" />
              Marketplace
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <MessageCircle className="h-5 w-5" />
              {unreadTotal > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
                  {unreadTotal}
                </span>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black">Centro de mensajes</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Chats con compradores y vendedores</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[360px_1fr] lg:px-6">
        <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
          <CardContent className="p-0">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                <Bell className="h-3.5 w-3.5" />
                {unreadTotal > 0 ? `${unreadTotal} sin leer` : "Todo al dia"}
              </div>
              <h2 className="text-xl font-black">Tus conversaciones</h2>
            </div>

            {loadingConversations ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <p className="font-black">Aun no tienes chats</p>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Abre un vehiculo y escribele al vendedor para iniciar una conversacion.
                </p>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-210px)] overflow-y-auto">
                {conversations.map((conversation) => {
                  const isActive = conversation.id === activeId
                  const otherPerson = getOtherPerson(conversation, userId)

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => {
                        setActiveId(conversation.id)
                        router.replace(`/chats?conversationId=${conversation.id}`)
                      }}
                      className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70 ${
                        isActive ? "bg-blue-50/80 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                        {conversation.imagen ? (
                          <img src={conversation.imagen} alt={`${conversation.marca} ${conversation.modelo}`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Car className="h-7 w-7 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-black text-slate-950 dark:text-slate-100">{otherPerson}</p>
                            <p className="truncate text-sm font-semibold text-blue-700 dark:text-blue-300">
                              {conversation.marca || "Vehiculo"} {conversation.modelo || ""}
                            </p>
                          </div>
                          {conversation.unread_count > 0 && (
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-black text-white">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                          {conversation.last_message || "Conversacion iniciada"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">{formatTime(conversation.last_message_at)}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
          <CardContent className="flex min-h-[620px] flex-col p-0">
            {error && (
              <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                {error}
              </div>
            )}

            {!activeConversation ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                  <MessageCircle className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-black">Selecciona un chat</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Aqui veras mensajes, estados de lectura y notificaciones de compradores o vendedores.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-black">{getOtherPerson(activeConversation, userId)}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {activeConversation.marca} {activeConversation.modelo} · {formatCurrency(activeConversation.precio)}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="rounded-2xl dark:border-slate-700 dark:bg-slate-900">
                    <Link href={`/vehicles/${activeConversation.vehicle_id}`}>Ver vehiculo</Link>
                  </Button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-5 dark:bg-slate-950/30">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = userId === Number(message.sender_id)

                      return (
                        <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                              isOwn
                                ? "rounded-br-md bg-blue-600 text-white shadow-blue-600/20"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                            <div className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${isOwn ? "text-blue-100" : "text-slate-400"}`}>
                              <span>{formatTime(message.creado_en)}</span>
                              {isOwn ? (
                                message.status === "read" ? (
                                  <>
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    <span>Leido</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Enviado</span>
                                  </>
                                )
                              ) : message.status === "read" ? (
                                <span>Leido</span>
                              ) : (
                                <span>No leido</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                  <div className="flex gap-3">
                    <Textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="min-h-[52px] resize-none rounded-2xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={sendMessage}
                      disabled={sending || !draft.trim()}
                      className="h-auto rounded-2xl bg-blue-600 px-5 font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                    >
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
