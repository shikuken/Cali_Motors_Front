'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSignOut } from "@/app/auth/actions"
import {
  Car,
  Plus,
  Search,
  User,
  Gauge,
  Calendar,
  Eye,
  Pencil,
  LogOut,
} from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value)
}

function getDisplayName(user: any) {
  if (user?.name) return user.name
  if (user?.email) {
    return user.email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }
  return "Juan"
}

function getVehicleImage(label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#111827" />
          <stop offset="100%" stop-color="#374151" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="600" height="360" fill="url(#bg)" rx="24" />
      <rect y="250" width="600" height="110" fill="url(#road)" />
      <circle cx="190" cy="250" r="36" fill="#111827" />
      <circle cx="410" cy="250" r="36" fill="#111827" />
      <circle cx="190" cy="250" r="18" fill="#9ca3af" />
      <circle cx="410" cy="250" r="18" fill="#9ca3af" />
      <path d="M140 210 L190 150 H360 C392 150 420 163 440 190 L470 210 Z" fill="#e5e7eb" opacity="0.95" />
      <rect x="120" y="190" width="360" height="48" rx="18" fill="#f8fafc" />
      <path d="M214 158 H350 C375 158 396 170 412 190 H196 Z" fill="#93c5fd" opacity="0.85" />
      <circle cx="152" cy="214" r="8" fill="#f59e0b" />
      <circle cx="448" cy="214" r="8" fill="#f87171" />
      <text x="32" y="52" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="700">${label}</text>
      <text x="32" y="88" fill="#d1d5db" font-family="Arial, sans-serif" font-size="18">Vehículo destacado</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}


export function DashboardContent({ user }: { user: any }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [userVehicles, setUserVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  
  const { data: stats, isLoading } = useSWR("/api/dashboard/stats", fetcher)
  const handleSignOut = useSignOut()

  const dashboardData = stats?.data
  const displayName = getDisplayName(user)
  const totalPublications = userVehicles.length
  const availableVehicles = userVehicles.filter((v) => v.estado === "Activo").length
  const soldVehicles = userVehicles.filter((v) => v.estado === "Vendido").length

  useEffect(() => {
    const fetchUserVehicles = async () => {
      try {
        const response = await fetch(`http://localhost:3001/vehicles/user/${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setUserVehicles(data)
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      } finally {
        setLoadingVehicles(false)
      }
    }

    if (user?.id) {
      fetchUserVehicles()
    }
  }, [user?.id])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold">Cali Motors</p>
              <p className="text-sm text-slate-500">Compra y venta de vehículos</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 lg:max-w-4xl lg:flex-row lg:items-center lg:justify-end">
            <div className="relative w-full lg:max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar vehículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <Button asChild className="h-11 rounded-xl px-5">
              <Link href="/vehicles/new">
                <Plus className="h-4 w-4" />
                Publicar vehículo
              </Link>
            </Button>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm lg:min-w-[180px]">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-slate-500">Mi perfil</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Car className="h-5 w-5" />
              </div>
              <div> 
                <p className="text-sm text-slate-500">Publicaciones</p>
                <p className="text-2xl font-bold">{isLoading ? "..." : totalPublications}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Vehículos activos</p>
                <p className="text-2xl font-bold">{isLoading ? "..." : availableVehicles}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Mis publicaciones</CardTitle>
              <CardDescription>Resumen de las publicaciones realizadas por el usuario.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVehicles ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-slate-500">Cargando vehículos...</p>
                </div>
              ) : userVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Car className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-600 font-medium">No has publicado vehículos aún</p>
                  <p className="text-sm text-slate-500 mb-4">Comienza publicando tu primer vehículo</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {userVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="overflow-hidden border-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      {vehicle.imagen ? (
                        <div className="aspect-[16/10] overflow-hidden bg-slate-200">
                          <img
                            src={vehicle.imagen}
                            alt={`${vehicle.marca} ${vehicle.modelo}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                          <Car className="h-16 w-16 text-slate-500" />
                        </div>
                      )}
                      <CardContent className="space-y-3 p-5">
                        <div>
                          <h3 className="text-lg font-bold">{vehicle.marca} {vehicle.modelo}</h3>
                          <p className="text-sm text-slate-500">{vehicle.año}</p>
                        </div>

                        <div>
                          <p className="text-2xl font-semibold text-slate-900">
                            ${Number(vehicle.precio).toLocaleString("es-CO")}
                          </p>
                        </div>

                        {vehicle.kilometraje > 0 && (
                          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                              <Gauge className="h-4 w-4" />
                              {Number(vehicle.kilometraje).toLocaleString("es-CO")} km
                            </span>
                          </div>
                        )}

                        {vehicle.descripcion && (
                          <p className="text-sm text-slate-600 line-clamp-2">{vehicle.descripcion}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              vehicle.estado === "Activo"
                                ? "bg-emerald-100 text-emerald-700"
                                : vehicle.estado === "Vendido"
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {vehicle.estado}
                          </span>

                          <Link href={`/vehicles/${vehicle.id}/edit`}>
                            <Button variant="outline" className="rounded-xl ml-auto h-9 text-xs">
                              <Pencil className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
