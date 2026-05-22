'use client'

import { useEffect, useState } from "react"
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, ArrowLeft, Loader2, Calendar, Gauge, Mail, Phone, User } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"

export type Vehicle = {
  marca?: string
  modelo?: string
  precio?: number
  año?: number
  kilometraje?: number
  imagen?: string
  descripcion?: string
  estado?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)

export const formatNumber = (value: number) => new Intl.NumberFormat("es-CO").format(value)

export function useVehicle(vehicleId: string) {
  const [loading, setLoading] = useState(true)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`)
        if (!response.ok) throw new Error("Vehiculo no encontrado")
        setVehicle(await response.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la informacion")
      } finally {
        setLoading(false)
      }
    }

    if (vehicleId) fetchVehicle()
  }, [vehicleId])

  return { loading, vehicle, error }
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl shadow-[0_24px_48px_-8px_rgba(0,0,0,0.7)]">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-400" />
        <p className="font-semibold text-slate-400">{label}</p>
      </div>
    </div>
  )
}

export function ErrorState({ message, vehicleId }: { message: string; vehicleId: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-950/40 text-red-400">
        <Car className="h-10 w-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-100">No pudimos cargar el vehiculo</h2>
      <p className="mb-8 max-w-md text-slate-400">{message}</p>
      <Button asChild className="rounded-xl px-6">
        <Link href={`/vehicles/${vehicleId}`}>
          <ArrowLeft className="h-4 w-4" />
          Volver al detalle
        </Link>
      </Button>
    </div>
  )
}

export function FlowShell({ title, subtitle, vehicleId, children }: { title: string; subtitle: string; vehicleId: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#111827_48%,#0f172a_100%)] pb-16">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <Button asChild variant="ghost" className="rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <Link href={`/vehicles/${vehicleId}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver al detalle
            </Link>
          </Button>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-100">{title}</p>
            <p className="hidden text-xs text-slate-400 sm:block">{subtitle}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">{children}</main>
    </div>
  )
}

export function VehicleSummaryCard({ vehicle, showDescription = false }: { vehicle: Vehicle; showDescription?: boolean }) {
  const price = Number(vehicle.precio || 0)
  const sellerName = [vehicle.first_name, vehicle.last_name].filter(Boolean).join(" ") || "Vendedor"

  return (
    <Card className="overflow-hidden rounded-3xl border-slate-800 bg-slate-900 shadow-xl shadow-[0_24px_48px_-8px_rgba(0,0,0,0.7)]">
      <div className="aspect-[16/10] overflow-hidden bg-slate-800">
        {vehicle.imagen ? (
          <img src={vehicle.imagen} alt={`${vehicle.marca || "Vehiculo"} ${vehicle.modelo || ""}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-600">
            <Car className="mb-3 h-16 w-16" />
            <span className="text-sm font-medium text-slate-400">Sin imagen disponible</span>
          </div>
        )}
      </div>
      <CardContent className="space-y-6 p-6">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-500/15 px-3 py-1 text-blue-300 hover:bg-blue-500/20 border-0">{vehicle.estado || "Sin estado"}</Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-100">
            {vehicle.marca || "Vehiculo"} <span className="font-light text-slate-400">{vehicle.modelo || ""}</span>
          </h1>
          <p className="mt-3 text-3xl font-black tracking-tight text-blue-400">{formatCurrency(price)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoPill icon={<Calendar className="h-4 w-4" />} label="Ano" value={vehicle.año || "N/D"} />
          <InfoPill icon={<Gauge className="h-4 w-4" />} label="Kilometraje" value={`${formatNumber(Number(vehicle.kilometraje || 0))} km`} />
        </div>

        {showDescription && (
          <div className="rounded-2xl bg-slate-800 p-4 text-sm leading-relaxed text-slate-300">
            {vehicle.descripcion || "El vendedor no proporciono una descripcion para este vehiculo."}
          </div>
        )}

        <div className="border-t border-slate-800 pt-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-100">
            <User className="h-4 w-4 text-slate-500" />
            Vendedor
          </p>
          <p className="font-semibold text-slate-200">{sellerName}</p>
          {vehicle.email && (
            <a href={`mailto:${vehicle.email}`} className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline">
              <Mail className="h-4 w-4" />
              <span className="truncate">{vehicle.email}</span>
            </a>
          )}
          {vehicle.phone && (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
              <Phone className="h-4 w-4" />
              {vehicle.phone}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-800 p-4">
      <p className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400">{icon}{label}</p>
      <p className="font-bold text-slate-100">{value}</p>
    </div>
  )
}

export function SuccessCard({ title, message, vehicleId }: { title: string; message: string; vehicleId: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="rounded-3xl border-emerald-900/60 bg-slate-900 text-center shadow-xl shadow-[0_24px_48px_-8px_rgba(0,0,0,0.7)]">
        <CardContent className="p-8 sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-950/40 text-emerald-400">
            <Car className="h-8 w-8" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-slate-100">{title}</h2>
          <p className="mb-8 text-slate-400">{message}</p>
          <Button asChild className="h-11 rounded-xl px-6">
            <Link href={`/vehicles/${vehicleId}`}>Volver al detalle del vehiculo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
