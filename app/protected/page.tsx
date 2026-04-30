"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardContent } from "@/components/dashboard-content"

export default function ProtectedPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/auth/login")
    } else {
      setUser(JSON.parse(storedUser))
    }
  }, [router])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="font-semibold text-slate-700">Preparando tu tablero...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <DashboardContent user={user} />
    </main>
  )
}
