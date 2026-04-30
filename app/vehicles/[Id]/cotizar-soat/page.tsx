'use client'

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Calculator, ShieldCheck } from "lucide-react"
import {
  ErrorState,
  FlowShell,
  formatCurrency,
  LoadingState,
  useVehicle,
  VehicleSummaryCard,
} from "../_components/vehicle-flow-shared"

function calcularSOATEstimado(valorVehiculo: number): number {
  const base = valorVehiculo * 0.0075 + 300000
  const minimo = 420000
  const maximo = 1500000

  return Math.round(Math.min(Math.max(base, minimo), maximo))
}

export default function CotizarSoatVehiclePage() {
  const params = useParams()
  const vehicleId = params.Id as string
  const { loading, vehicle, error } = useVehicle(vehicleId)

  if (loading) return <LoadingState label="Calculando SOAT estimado..." />
  if (error || !vehicle) return <ErrorState message={error || "No hay informacion del vehiculo"} vehicleId={vehicleId} />

  const vehiclePrice = Number(vehicle.precio || 0)
  const soatEstimated = calcularSOATEstimado(vehiclePrice)

  return (
    <FlowShell title="Cotizar SOAT" subtitle="Estimacion referencial" vehicleId={vehicleId}>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <VehicleSummaryCard vehicle={vehicle} />

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-xl shadow-slate-200/60">
            <CardHeader className="bg-slate-950 text-white">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShieldCheck className="h-6 w-6 text-blue-300" />
                Resultado de SOAT estimado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-3xl bg-blue-50 p-6 text-center">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-700">SOAT estimado</p>
                <p className="text-4xl font-black tracking-tight text-blue-700">{formatCurrency(soatEstimated)}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Valor del vehiculo" value={formatCurrency(vehiclePrice)} />
                <Metric label="Valor minimo aplicado" value="$420.000 COP" />
                <Metric label="Valor maximo aplicado" value="$1.500.000 COP" />
                <Metric label="Tipo de calculo" value="Referencial" />
              </div>

              <Separator />

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4" />
                  Aviso importante
                </div>
                Este valor es referencial y puede variar según entidad, tipo de vehículo y normativa vigente.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                <Calculator className="h-6 w-6 text-blue-600" />
                Informacion basica
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Metric label="Marca" value={vehicle.marca || "N/D"} />
              <Metric label="Modelo" value={vehicle.modelo || "N/D"} />
              <Metric label="Ano" value={String(vehicle.año || "N/D")} />
              <Metric label="Estado" value={vehicle.estado || "Sin estado"} />
            </CardContent>
          </Card>
        </div>
      </div>
    </FlowShell>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
      <p className="font-bold text-slate-950">{value}</p>
    </div>
  )
}
