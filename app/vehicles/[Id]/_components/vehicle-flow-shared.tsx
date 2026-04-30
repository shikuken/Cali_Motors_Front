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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="font-semibold text-slate-700">{label}</p>
      </div>
    </div>
  )
}

export function ErrorState({ message, vehicleId }: { message: string; vehicleId: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
        <Car className="h-10 w-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-950">No pudimos cargar el vehiculo</h2>
      <p className="mb-8 max-w-md text-slate-600">{message}</p>
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] pb-16 dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_48%,#0f172a_100%)]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <Button asChild variant="ghost" className="rounded-xl text-slate-600 hover:text-slate-950">
            <Link href={`/vehicles/${vehicleId}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver al detalle
            </Link>
          </Button>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-950 dark:text-slate-100">{title}</p>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">{subtitle}</p>
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
    <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
      <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {vehicle.imagen ? (
          <img src={vehicle.imagen} alt={`${vehicle.marca || "Vehiculo"} ${vehicle.modelo || ""}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <Car className="mb-3 h-16 w-16" />
            <span className="text-sm font-medium">Sin imagen disponible</span>
          </div>
        )}
      </div>
      <CardContent className="space-y-6 p-6">
        <div>
          <Badge className="mb-3 rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-50">{vehicle.estado || "Sin estado"}</Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">
            {vehicle.marca || "Vehiculo"} <span className="font-light text-slate-500 dark:text-slate-400">{vehicle.modelo || ""}</span>
          </h1>
          <p className="mt-3 text-3xl font-black tracking-tight text-blue-600">{formatCurrency(price)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoPill icon={<Calendar className="h-4 w-4" />} label="Ano" value={vehicle.año || "N/D"} />
          <InfoPill icon={<Gauge className="h-4 w-4" />} label="Kilometraje" value={`${formatNumber(Number(vehicle.kilometraje || 0))} km`} />
        </div>

        {showDescription && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {vehicle.descripcion || "El vendedor no proporciono una descripcion para este vehiculo."}
          </div>
        )}

        <div className="border-t border-slate-100 pt-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-slate-100">
            <User className="h-4 w-4 text-slate-400" />
            Vendedor
          </p>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{sellerName}</p>
          {vehicle.email && (
            <a href={`mailto:${vehicle.email}`} className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <Mail className="h-4 w-4" />
              <span className="truncate">{vehicle.email}</span>
            </a>
          )}
          {vehicle.phone && (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
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
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">{icon}{label}</p>
      <p className="font-bold text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  )
}

export function SuccessCard({ title, message, vehicleId }: { title: string; message: string; vehicleId: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="rounded-3xl border-emerald-100 bg-white text-center shadow-xl shadow-emerald-100/60 dark:border-emerald-900/60 dark:bg-slate-900">
        <CardContent className="p-8 sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
            <Car className="h-8 w-8" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-slate-950 dark:text-slate-100">{title}</h2>
          <p className="mb-8 text-slate-600 dark:text-slate-400">{message}</p>
          <Button asChild className="h-11 rounded-xl px-6">
            <Link href={`/vehicles/${vehicleId}`}>Volver al detalle del vehiculo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
