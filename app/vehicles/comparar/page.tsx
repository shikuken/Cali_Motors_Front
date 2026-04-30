'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Car, Gauge, Scale, ShieldCheck, Trash2, X } from "lucide-react"

const compareStorageKey = "caliMotorsCompareVehicles"

type CompareVehicle = {
  id: number
  marca?: string
  modelo?: string
  precio?: number
  year?: number | string
  kilometraje?: number
  estado?: string
  imagen?: string
  descripcion?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)

const formatNumber = (value: number) => new Intl.NumberFormat("es-CO").format(value)

export default function CompareVehiclesPage() {
  const [vehicles, setVehicles] = useState<CompareVehicle[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(compareStorageKey)
      setVehicles(saved ? JSON.parse(saved) : [])
    } catch {
      setVehicles([])
    }
  }, [])

  const bestPriceId = useMemo(() => {
    const withPrice = vehicles.filter((vehicle) => Number(vehicle.precio || 0) > 0)
    if (withPrice.length === 0) return null
    return withPrice.reduce((best, current) => Number(current.precio) < Number(best.precio) ? current : best).id
  }, [vehicles])

  const lowestKmId = useMemo(() => {
    const withKm = vehicles.filter((vehicle) => Number(vehicle.kilometraje || 0) >= 0)
    if (withKm.length === 0) return null
    return withKm.reduce((best, current) => Number(current.kilometraje || 0) < Number(best.kilometraje || 0) ? current : best).id
  }, [vehicles])

  const removeVehicle = (vehicleId: number) => {
    const nextVehicles = vehicles.filter((vehicle) => vehicle.id !== vehicleId)
    setVehicles(nextVehicles)
    localStorage.setItem(compareStorageKey, JSON.stringify(nextVehicles))
  }

  const clearCompare = () => {
    setVehicles([])
    localStorage.removeItem(compareStorageKey)
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] pb-12 dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_48%,#0f172a_100%)]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
          <Button asChild variant="ghost" className="rounded-xl text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            <Link href="/protected">
              <ArrowLeft className="h-4 w-4" />
              Volver al marketplace
            </Link>
          </Button>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <Scale className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black text-slate-950 dark:text-slate-100">Comparador</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Compara hasta 3 vehiculos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <section className="mb-6 rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/60 dark:bg-slate-900 dark:shadow-slate-950/20">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-blue-100">
                <ShieldCheck className="h-4 w-4" />
                Decision mas clara
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Compara tus mejores opciones</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Revisa precio, kilometraje, estado, vendedor y costos referenciales para elegir con mejor criterio.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="rounded-2xl bg-blue-600 font-bold hover:bg-blue-700">
                <Link href="/protected">Agregar mas vehiculos</Link>
              </Button>
              {vehicles.length > 0 && (
                <Button variant="outline" className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950" onClick={clearCompare}>
                  <Trash2 className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </section>

        {vehicles.length === 0 ? (
          <Card className="rounded-[2rem] border-slate-200 bg-white text-center shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
            <CardContent className="p-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                <Scale className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100">Aun no hay vehiculos para comparar</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Vuelve al marketplace y usa el boton Comparar en las tarjetas de vehiculo. Puedes elegir hasta 3.
              </p>
              <Button asChild className="mt-6 rounded-2xl bg-blue-600 font-bold hover:bg-blue-700">
                <Link href="/protected">Ir al marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {vehicle.imagen ? (
                      <img src={vehicle.imagen} alt={`${vehicle.marca} ${vehicle.modelo}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Car className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeVehicle(vehicle.id)}
                      className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-600 shadow-lg transition hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/90 dark:text-slate-300"
                      aria-label="Quitar del comparador"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <p className="text-xl font-black text-slate-950 dark:text-slate-100">
                        {vehicle.marca} <span className="font-light text-slate-500 dark:text-slate-400">{vehicle.modelo}</span>
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.year || "N/D"}</p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-500/15">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Precio</p>
                      <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{formatCurrency(Number(vehicle.precio || 0))}</p>
                    </div>
                    <Button asChild className="w-full rounded-2xl bg-slate-950 font-bold hover:bg-blue-700 dark:bg-blue-600">
                      <Link href={`/vehicles/${vehicle.id}`}>Ver detalle</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
                        <th className="w-56 px-5 py-4 font-black text-slate-950 dark:text-slate-100">Caracteristica</th>
                        {vehicles.map((vehicle) => (
                          <th key={vehicle.id} className="px-5 py-4 font-black text-slate-950 dark:text-slate-100">
                            {vehicle.marca} {vehicle.modelo}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <CompareRow label="Precio" vehicles={vehicles} render={(vehicle) => (
                        <HighlightedValue active={vehicle.id === bestPriceId} value={formatCurrency(Number(vehicle.precio || 0))} note={vehicle.id === bestPriceId ? "Mejor precio" : undefined} />
                      )} />
                      <CompareRow label="Ano" vehicles={vehicles} render={(vehicle) => vehicle.year || "N/D"} />
                      <CompareRow label="Kilometraje" vehicles={vehicles} render={(vehicle) => (
                        <HighlightedValue active={vehicle.id === lowestKmId} value={`${formatNumber(Number(vehicle.kilometraje || 0))} km`} note={vehicle.id === lowestKmId ? "Menor km" : undefined} icon={<Gauge className="h-3.5 w-3.5" />} />
                      )} />
                      <CompareRow label="Estado" vehicles={vehicles} render={(vehicle) => vehicle.estado || "Sin estado"} />
                      <CompareRow label="Vendedor" vehicles={vehicles} render={(vehicle) => [vehicle.first_name, vehicle.last_name].filter(Boolean).join(" ") || "Vendedor"} />
                      <CompareRow label="Correo" vehicles={vehicles} render={(vehicle) => vehicle.email || "No disponible"} />
                      <CompareRow label="Telefono" vehicles={vehicles} render={(vehicle) => vehicle.phone || "No disponible"} />
                      <CompareRow label="SOAT estimado" vehicles={vehicles} render={(vehicle) => formatCurrency(calcularSOATEstimado(Number(vehicle.precio || 0)))} />
                      <CompareRow label="Cuota inicial 15%" vehicles={vehicles} render={(vehicle) => formatCurrency(Number(vehicle.precio || 0) * 0.15)} />
                      <CompareRow label="Costo inicial referencial" vehicles={vehicles} render={(vehicle) => formatCurrency(calcularSOATEstimado(Number(vehicle.precio || 0)) + Number(vehicle.precio || 0) * 0.15)} />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

function CompareRow({
  label,
  vehicles,
  render,
}: {
  label: string
  vehicles: CompareVehicle[]
  render: (vehicle: CompareVehicle) => React.ReactNode
}) {
  return (
    <tr>
      <td className="px-5 py-4 font-bold text-slate-500 dark:text-slate-400">{label}</td>
      {vehicles.map((vehicle) => (
        <td key={vehicle.id} className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
          {render(vehicle)}
        </td>
      ))}
    </tr>
  )
}

function HighlightedValue({
  active,
  value,
  note,
  icon,
}: {
  active: boolean
  value: string
  note?: string
  icon?: React.ReactNode
}) {
  return (
    <div className={active ? "inline-flex flex-col rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" : "inline-flex flex-col"}>
      <span className="flex items-center gap-1.5">
        {icon}
        {value}
      </span>
      {note && <span className="mt-1 text-xs font-black uppercase tracking-wide">{note}</span>}
    </div>
  )
}

function calcularSOATEstimado(valorVehiculo: number): number {
  const base = valorVehiculo * 0.0075 + 300000
  const minimo = 420000
  const maximo = 1500000

  return Math.round(Math.min(Math.max(base, minimo), maximo))
}

