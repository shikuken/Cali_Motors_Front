'use client'

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleSearch, Filters } from "@/components/ui/vehicle-search"
import { useSignOut } from "@/app/auth/actions"
import {
  Car,
  Plus,
  Search,
  User,
  Gauge,
  Eye,
  Pencil,
  LogOut,
  Trash2,
  Loader2,
} from "lucide-react"
import useSWR from "swr"
import { fetchWithAuth } from "@/lib/api"

const fetcher = (url: string) => fetchWithAuth(url).then((res) => res.json())

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

  const handleDeleteClick = (id: number) => {
    setConfirmId(id)
  }

  const handleConfirmDelete = async (id: number) => {
    if (!onDelete) return
    setDeletingId(id)
    setConfirmId(null)
    await onDelete(id)
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <p className="text-slate-500">Cargando vehículos...</p>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
        <Search className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-slate-600 font-medium">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => (
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
                className={`rounded-full px-3 py-1 text-xs font-medium ${vehicle.estado === "Activo"
                  ? "bg-emerald-100 text-emerald-700"
                  : vehicle.estado === "Vendido"
                    ? "bg-slate-200 text-slate-700"
                    : "bg-amber-100 text-amber-700"
                  }`}
              >
                {vehicle.estado}
              </span>

              {isOwner || isAdmin ? (
                <div className="ml-auto flex items-center gap-2">
                  {/* Confirmación de eliminación inline */}
                  {confirmId === vehicle.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-600 mr-1">¿Eliminar?</span>
                      <Button
                        variant="destructive"
                        className="rounded-xl h-9 text-xs px-3"
                        onClick={() => handleConfirmDelete(vehicle.id)}
                        disabled={deletingId === vehicle.id}
                      >
                        Sí
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl h-9 text-xs px-3"
                        onClick={() => setConfirmId(null)}
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="rounded-xl h-9 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleDeleteClick(vehicle.id)}
                        disabled={deletingId === vehicle.id}
                      >
                        {deletingId === vehicle.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                      <Link href={`/vehicles/${vehicle.id}/edit`}>
                        <Button variant="outline" className="rounded-xl h-9 text-xs">
                          <Pencil className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <Link href={`/vehicles/${vehicle.id}`} className="ml-auto">
                  <Button variant="default" className="rounded-xl h-9 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
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

  const { data: stats, isLoading } = useSWR("/api/dashboard/stats", fetcher)
  const handleSignOut = useSignOut()

  const displayName = getDisplayName(user)
  const totalPublications = userVehicles.length
  const availableVehicles = userVehicles.filter((v) => v.estado === "Activo").length

  const filterFn = (vehicle: any) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      vehicle.marca?.toLowerCase().includes(searchLower) ||
      vehicle.modelo?.toLowerCase().includes(searchLower) ||
      String(vehicle.año).includes(searchLower) ||
      vehicle.descripcion?.toLowerCase().includes(searchLower)

    const matchesBrand = filters.marca === "" || vehicle.marca === filters.marca
    const matchesMinYear = filters.minYear === "" || vehicle.año >= parseInt(filters.minYear)
    const matchesMaxYear = filters.maxYear === "" || vehicle.año <= parseInt(filters.maxYear)
    const matchesMinPrice = filters.minPrice === "" || vehicle.precio >= parseInt(filters.minPrice)
    const matchesMaxPrice = filters.maxPrice === "" || vehicle.precio <= parseInt(filters.maxPrice)
    const matchesEstado = filters.estado === "" || vehicle.estado === filters.estado

    return matchesSearch && matchesBrand && matchesMinYear && matchesMaxYear && matchesMinPrice && matchesMaxPrice && matchesEstado
  }

  const filteredUserVehicles = userVehicles.filter(filterFn)
  const filteredAllVehicles = allVehicles.filter(filterFn)

  const fetchUserVehicles = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserVehicles(data)
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoadingVehicles(false)
    }
  }, [user.id])

  const fetchAllVehicles = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/vehicles`)
      if (response.ok) {
        const data = await response.json()
        setAllVehicles(data)
      }
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
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        // Actualizar ambas listas localmente sin refetch
        setUserVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
        setAllVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
      } else {
        console.error("Error al eliminar el vehículo")
      }
    } catch (error) {
      console.error("Error al eliminar:", error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-900 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-6">
            <Link href="/profile" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm lg:min-w-[180px] hover:bg-slate-50 transition">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{displayName}</p>
                    {user?.rol === 'admin' && (
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Mi perfil</p>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Cali Motors</p>
                <p className="text-sm text-white">Compra y venta de vehículos</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <VehicleSearch
              allVehicles={allVehicles}
              onSearchChange={(term, newFilters) => {
                setSearchTerm(term)
                setFilters(newFilters)
              }}
            />

            <Button asChild className="h-11 rounded-xl px-5">
              <Link href="/vehicles/new">
                <Plus className="h-4 w-4" />
                Publicar vehículo
              </Link>
            </Button>

            <button
              type="button"
              onClick={handleSignOut}
              className="cursor-pointer rounded-lg p-2 text-white transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
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
                <p className="text-sm text-slate-500">Mis Publicaciones</p>
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
                <p className="text-sm text-slate-500">Mis Vehículos activos</p>
                <p className="text-2xl font-bold">{isLoading ? "..." : availableVehicles}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Tabs defaultValue="explore" className="w-full">
            <div className="mb-4">
              <TabsList className="bg-slate-200/50 p-1">
                <TabsTrigger value="explore">Explorar Todos</TabsTrigger>
                <TabsTrigger value="my-vehicles">Mis Publicaciones</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="explore" className="mt-0">
              <VehicleGrid
                loading={loadingAllVehicles}
                vehicles={filteredAllVehicles}
                emptyMessage={searchTerm ? "No se encontraron resultados en explorar" : "No hay vehículos publicados por la comunidad"}
                isOwner={false}
                isAdmin={user?.rol === 'admin'}
                onDelete={handleDeleteVehicle}
              />
            </TabsContent>

            <TabsContent value="my-vehicles" className="mt-0">
              <VehicleGrid
                loading={loadingVehicles}
                vehicles={filteredUserVehicles}
                emptyMessage={searchTerm ? "No se encontraron resultados en tus vehículos" : "No has publicado vehículos aún"}
                isOwner={true}
                onDelete={handleDeleteVehicle}
              />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  )
}