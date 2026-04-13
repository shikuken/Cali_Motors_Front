'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Car, ArrowLeft, Loader2, Calendar, Gauge, User, Phone, Mail, Tag, CheckCircle2 } from "lucide-react"

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  // Since the folder is named [Id], the param is accessed as params.Id
  const vehicleId = params.Id as string

  const [loading, setLoading] = useState(true)
  const [vehicle, setVehicle] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`)
        if (!response.ok) {
          throw new Error("Vehículo no encontrado")
        }
        const data = await response.json()
        setVehicle(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la información")
      } finally {
        setLoading(false)
      }
    }

    if (vehicleId) {
      fetchVehicle()
    }
  }, [vehicleId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-500 mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">Cargando detalles del vehículo...</p>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Car className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ups, algo salió mal</h2>
        <p className="text-slate-600 mb-8 max-w-md">{error || "No se pudo cargar la información del vehículo"}</p>
        <Button onClick={() => router.push("/protected")} className="rounded-xl px-8">
          Volver al catálogo
        </Button>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-CO").format(value)
  }

  const sellerName = vehicle.first_name && vehicle.last_name 
    ? `${vehicle.first_name} ${vehicle.last_name}`
    : "Vendedor"

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
          <Link href="/protected" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <div className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="font-medium hidden sm:inline">Volver a Explorar</span>
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Car className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900">Cali Motors</p>
              <p className="text-xs text-slate-500">Detalles del vehículo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
        {/* Banner de estado si no está activo */}
        {vehicle.estado !== "Activo" && (
          <div className={`mb-6 rounded-2xl p-4 flex items-center justify-center gap-2 border shadow-sm ${
            vehicle.estado === "Vendido" ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <Tag className="h-5 w-5" />
            <span className="font-semibold text-lg">
              Este vehículo está actualmente marcado como {vehicle.estado}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Imagen del vehículo */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-200 relative aspect-[4/3] group">
              {vehicle.imagen ? (
                <img
                  src={vehicle.imagen}
                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center">
                  <Car className="h-24 w-24 text-slate-400 mb-4" />
                  <p className="text-slate-500 font-medium">Sin imagen disponible</p>
                </div>
              )}
            </div>

            {/* Descripción */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Descripción del Vehículo
                </h3>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                  {vehicle.descripcion ? (
                    <p className="whitespace-pre-wrap">{vehicle.descripcion}</p>
                  ) : (
                    <p className="italic text-slate-400">El vendedor no proporcionó una descripción para este vehículo.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Detalles y Vendedor */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tarjeta Principal de Precio y Modelo */}
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5">
                <Car className="w-32 h-32" />
              </div>
              <CardContent className="p-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium text-xs mb-4">
                  <CheckCircle2 className="w-4 h-4" />
                  Vehículo Verificado
                </div>
                
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {vehicle.marca} <span className="font-light text-slate-500">{vehicle.modelo}</span>
                </h1>
                
                <p className="text-5xl font-black text-blue-600 my-6 tracking-tighter">
                  {formatCurrency(vehicle.precio)}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
                  <div className="flex flex-col p-4 bg-slate-50 rounded-2xl">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
                      <Calendar className="w-4 h-4" /> Año
                    </span>
                    <span className="text-xl font-bold text-slate-900">{vehicle.año}</span>
                  </div>
                  <div className="flex flex-col p-4 bg-slate-50 rounded-2xl">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
                      <Gauge className="w-4 h-4" /> Kilometraje
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {vehicle.kilometraje > 0 ? `${formatNumber(vehicle.kilometraje)} km` : '0 km'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tarjeta de Información del Vendedor */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" />
                  Información del Vendedor
                </h3>
                
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {vehicle.first_name ? vehicle.first_name.charAt(0) : 'V'}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="text-xl font-bold text-slate-900 truncate">{sellerName}</p>
                    <a href={`mailto:${vehicle.email}`} className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 mt-1.5 text-sm truncate">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{vehicle.email}</span>
                    </a>
                    {vehicle.phone && (
                      <p className="text-slate-600 flex items-center gap-1.5 mt-1.5 text-sm truncate">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{vehicle.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}