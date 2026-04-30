'use client'

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleSearch, Filters } from "@/components/ui/vehicle-search"
import { useSignOut } from "@/app/auth/actions"
import { fetchWithAuth } from "@/lib/api"
import useSWR from "swr"
import {
  Car,
  Eye,
  Gauge,
  Loader2,
  LogOut,
  Moon,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react"

const fetcher = (url: string) => fetchWithAuth(url).then((res) => res.json())
const nativeYearKey = "a" + String.fromCharCode(241) + "o"
const mojibakeYearKey = "a" + String.fromCharCode(195, 177) + "o"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)
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
  return "Usuario"
}

function getVehicleYear(vehicle: any) {
  return vehicle[nativeYearKey] ?? vehicle[mojibakeYearKey] ?? "N/D"
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const active = saved === "dark"
    document.documentElement.classList.toggle("dark", active)
    setIsDark(active)
  }, [])

  const toggle = () => {
    const next = !isDark
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
    setIsDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-slate-200 transition hover:bg-white hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
      aria-label="Cambiar modo oscuro"
      title="Cambiar modo oscuro"
    >
      <Sun className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
    </button>
  )
}

function VehicleGrid({
  vehicles,
  loading,
  emptyMessage,
  isOwner,
  isAdmin,
  onDelete,
}: {
  vehicles: any[]
  loading: boolean
  emptyMessage: string
  isOwner: boolean
  isAdmin?: boolean
  onDelete?: (id: number) => Promise<void>
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const handleConfirmDelete = async (id: number) => {
    if (!onDelete) return
    setDeletingId(id)
    setConfirmId(null)
    await onDelete(id)
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-[430px] animate-pulse rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <Search className="h-8 w-8" />
        </div>
        <p className="font-bold text-slate-900 dark:text-slate-100">{emptyMessage}</p>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Ajusta los filtros o publica un nuevo vehiculo para verlo aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id} className="group flex min-h-[430px] overflow-hidden rounded-3xl border-slate-200 bg-white shadow-xl shadow-slate-200/60 premium-card-hover dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
            {vehicle.imagen ? (
              <img
                src={vehicle.imagen}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-slate-900">
                <Car className="h-16 w-16 text-slate-300 dark:text-slate-600" />
              </div>
            )}
            <span
              className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-black shadow-lg backdrop-blur ${
                vehicle.estado === "Activo"
                  ? "bg-emerald-500 text-white"
                  : vehicle.estado === "Vendido"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                    : "bg-amber-400 text-amber-950"
              }`}
            >
              {vehicle.estado}
            </span>
          </div>

          <CardContent className="flex flex-1 flex-col space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">
                  {vehicle.marca} <span className="font-light text-slate-500 dark:text-slate-400">{vehicle.modelo}</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{getVehicleYear(vehicle)}</p>
              </div>
              <p className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                {formatCurrency(Number(vehicle.precio || 0))}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium dark:bg-slate-800">
                <Gauge className="h-4 w-4" />
                {Number(vehicle.kilometraje || 0).toLocaleString("es-CO")} km
              </span>
              {vehicle.first_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium dark:bg-slate-800">
                  <User className="h-4 w-4" />
                  {vehicle.first_name}
                </span>
              )}
            </div>

            <p className="line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-slate-600 dark:text-slate-400">
              {vehicle.descripcion || "Publicacion con informacion basica disponible para revisar en detalle."}
            </p>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              {isOwner || isAdmin ? (
                confirmId === vehicle.id ? (
                  <div className="flex w-full items-center justify-between rounded-2xl bg-red-50 p-2 dark:bg-red-950/30">
                    <span className="text-xs font-semibold text-red-700 dark:text-red-300">Eliminar publicacion?</span>
                    <div className="flex gap-1">
                      <Button variant="destructive" className="h-8 rounded-xl px-3 text-xs" onClick={() => handleConfirmDelete(vehicle.id)} disabled={deletingId === vehicle.id}>
                        Si
                      </Button>
                      <Button variant="outline" className="h-8 rounded-xl px-3 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" onClick={() => setConfirmId(null)}>
                        No
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button variant="outline" className="h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/30" onClick={() => setConfirmId(vehicle.id)} disabled={deletingId === vehicle.id}>
                      {deletingId === vehicle.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                    <Button asChild variant="outline" className="h-10 flex-1 rounded-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                      <Link href={`/vehicles/${vehicle.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <Button asChild className="h-10 flex-1 rounded-xl bg-blue-600 hover:bg-blue-700">
                      <Link href={`/vehicles/${vehicle.id}`}>
                        <Eye className="h-4 w-4" />
                        Ver
                      </Link>
                    </Button>
                  </>
                )
              ) : (
                <Button asChild className="h-10 w-full rounded-xl bg-blue-600 font-bold hover:bg-blue-700">
                  <Link href={`/vehicles/${vehicle.id}`}>
                    <Eye className="h-4 w-4" />
                    Ver detalles
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FeaturedVehiclePopup({ vehicles }: { vehicles: any[] }) {
  const [visible, setVisible] = useState(false)
  const featured = useMemo(() => {
    const available = vehicles.filter((vehicle) => vehicle.estado === "Activo")
    if (available.length === 0) return null
    return available[Math.floor(Math.random() * available.length)]
  }, [vehicles])

  useEffect(() => {
    if (!featured || sessionStorage.getItem("featuredVehicleDismissed") === "true") return
    const timer = window.setTimeout(() => setVisible(true), 1200)
    return () => window.clearTimeout(timer)
  }, [featured])

  if (!visible || !featured) return null

  const dismiss = () => {
    sessionStorage.setItem("featuredVehicleDismissed", "true")
    setVisible(false)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm float-in">
      <div className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-black text-slate-950 dark:text-slate-100">Vehiculo destacado</p>
          </div>
          <button onClick={dismiss} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-4 p-4">
          <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
            {featured.imagen ? (
              <img src={featured.imagen} alt={`${featured.marca} ${featured.modelo}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Car className="h-7 w-7 text-slate-300" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-black text-slate-950 dark:text-slate-100">{featured.marca} {featured.modelo}</p>
            <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-300">{formatCurrency(Number(featured.precio || 0))}</p>
            <Button asChild size="sm" className="mt-3 h-8 rounded-xl bg-slate-950 text-xs hover:bg-blue-700 dark:bg-blue-600">
              <Link href={`/vehicles/${featured.id}`}>Ver ahora</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardContent({ user }: { user: any }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Filters>({
    marca: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    estado: "",
  })
  const [userVehicles, setUserVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [allVehicles, setAllVehicles] = useState<any[]>([])
  const [loadingAllVehicles, setLoadingAllVehicles] = useState(true)
  const { isLoading } = useSWR("/api/dashboard/stats", fetcher)
  const handleSignOut = useSignOut()

  const displayName = getDisplayName(user)
  const totalPublications = userVehicles.length
  const availableVehicles = userVehicles.filter((v) => v.estado === "Activo").length

  const filterFn = (vehicle: any) => {
    const searchLower = searchTerm.toLowerCase()
    const year = getVehicleYear(vehicle)
    const matchesSearch =
      searchTerm === "" ||
      vehicle.marca?.toLowerCase().includes(searchLower) ||
      vehicle.modelo?.toLowerCase().includes(searchLower) ||
      String(year).includes(searchLower) ||
      vehicle.descripcion?.toLowerCase().includes(searchLower)

    return (
      matchesSearch &&
      (filters.marca === "" || vehicle.marca === filters.marca) &&
      (filters.minYear === "" || Number(year) >= parseInt(filters.minYear)) &&
      (filters.maxYear === "" || Number(year) <= parseInt(filters.maxYear)) &&
      (filters.minPrice === "" || vehicle.precio >= parseInt(filters.minPrice)) &&
      (filters.maxPrice === "" || vehicle.precio <= parseInt(filters.maxPrice)) &&
      (filters.estado === "" || vehicle.estado === filters.estado)
    )
  }

  const filteredUserVehicles = userVehicles.filter(filterFn)
  const filteredAllVehicles = allVehicles.filter(filterFn)

  const fetchUserVehicles = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/user/${user.id}`)
      if (response.ok) setUserVehicles(await response.json())
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoadingVehicles(false)
    }
  }, [user.id])

  const fetchAllVehicles = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/vehicles`)
      if (response.ok) setAllVehicles(await response.json())
    } catch (error) {
      console.error("Error fetching all vehicles:", error)
    } finally {
      setLoadingAllVehicles(false)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchUserVehicles()
      fetchAllVehicles()
    }
  }, [user?.id, fetchUserVehicles, fetchAllVehicles])

  const handleDeleteVehicle = async (vehicleId: number) => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`, { method: "DELETE" })
      if (response.ok) {
        setUserVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
        setAllVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
      } else {
        console.error("Error al eliminar el vehiculo")
      }
    } catch (error) {
      console.error("Error al eliminar:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_42%,#f8fafc_100%)] text-slate-900 transition-colors duration-500 dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_46%,#0f172a_100%)] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-slate-950/95 text-white shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/protected" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">Cali Motors</p>
                <p className="text-xs text-slate-300">Compra y venta de vehiculos</p>
              </div>
            </Link>

            <Link href="/profile" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm transition hover:bg-white hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white">
              <User className="h-4 w-4" />
              <span className="hidden font-semibold sm:inline">{displayName}</span>
              {user?.rol === "admin" && <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-black text-white">Admin</span>}
            </Link>
          </div>

          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <VehicleSearch
              allVehicles={allVehicles}
              onSearchChange={(term, newFilters) => {
                setSearchTerm(term)
                setFilters(newFilters)
              }}
            />
            <Button asChild className="h-11 rounded-2xl bg-blue-600 px-5 font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500">
              <Link href="/vehicles/new">
                <Plus className="h-4 w-4" />
                Publicar vehiculo
              </Link>
            </Button>
            <ThemeToggle />
            <button type="button" onClick={handleSignOut} className="rounded-2xl p-3 text-slate-300 transition hover:bg-white/10 hover:text-white dark:hover:bg-slate-800" aria-label="Cerrar sesion" title="Cerrar sesion">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/60 dark:bg-slate-900 dark:shadow-slate-950/20">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-blue-100">
                <ShieldCheck className="h-4 w-4" />
                Inventario actualizado
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Hola, {displayName}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Explora vehiculos disponibles, administra tus publicaciones y encuentra oportunidades con mejor contexto visual.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Car className="h-5 w-5" />} label="Mis publicaciones" value={isLoading ? "..." : totalPublications} />
              <StatCard icon={<Eye className="h-5 w-5" />} label="Activas" value={isLoading ? "..." : availableVehicles} accent />
            </div>
          </div>
        </section>

        <section>
          <Tabs defaultValue="explore" className="w-full">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="h-12 rounded-2xl bg-white p-1 shadow-lg shadow-slate-200/70 dark:bg-slate-900 dark:shadow-slate-950/20">
                <TabsTrigger value="explore" className="rounded-xl px-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-lg dark:text-slate-300 dark:hover:bg-slate-800 dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white">
                  Explorar todos
                </TabsTrigger>
                <TabsTrigger value="my-vehicles" className="rounded-xl px-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-lg dark:text-slate-300 dark:hover:bg-slate-800 dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white">
                  Mis publicaciones
                </TabsTrigger>
              </TabsList>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{filteredAllVehicles.length} vehiculos visibles</p>
            </div>

            <TabsContent value="explore" className="mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-2">
              <VehicleGrid
                loading={loadingAllVehicles}
                vehicles={filteredAllVehicles}
                emptyMessage={searchTerm ? "No se encontraron resultados en explorar" : "No hay vehiculos publicados por la comunidad"}
                isOwner={false}
                isAdmin={user?.rol === "admin"}
                onDelete={handleDeleteVehicle}
              />
            </TabsContent>

            <TabsContent value="my-vehicles" className="mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-2">
              <VehicleGrid
                loading={loadingVehicles}
                vehicles={filteredUserVehicles}
                emptyMessage={searchTerm ? "No se encontraron resultados en tus vehiculos" : "No has publicado vehiculos aun"}
                isOwner
                onDelete={handleDeleteVehicle}
              />
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <FeaturedVehiclePopup vehicles={allVehicles} />
    </div>
  )
}

function StatCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
      <div className={`mb-3 inline-flex rounded-2xl p-3 ${accent ? "bg-emerald-400 text-emerald-950" : "bg-blue-500 text-white"}`}>
        {icon}
      </div>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  )
}
