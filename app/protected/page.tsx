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
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  }

  return (
    <main className="min-h-screen">
      <DashboardContent user={user} />
    </main>
  )
}
