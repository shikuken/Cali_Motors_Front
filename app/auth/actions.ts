"use client"

import { useRouter } from "next/navigation"

export function useSignOut() {
  const router = useRouter()

  const handleSignOut = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/auth/login")
  }

  return handleSignOut
}
