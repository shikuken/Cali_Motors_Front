'use client'

import { FormEvent, useMemo, useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BadgePercent, Calculator, Send } from "lucide-react"
import {
  ErrorState,
  FlowShell,
  formatCurrency,
  LoadingState,
  SuccessCard,
  useVehicle,
  VehicleSummaryCard,
} from "../_components/vehicle-flow-shared"

const monthlyRates: Record<number, number> = {
  12: 0.015,
  24: 0.017,
  36: 0.019,
  48: 0.021,
  64: 0.023,
}

function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number,
  months: number
): number {
  if (principal <= 0) return 0

  return (
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  )
}

export default function FinanciarVehiclePage() {
  const params = useParams()
  const vehicleId = params.Id as string
  const { loading, vehicle, error } = useVehicle(vehicleId)
  const [months, setMonths] = useState(36)
  const [downPaymentValue, setDownPaymentValue] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [document, setDocument] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser)
        setFirstName(u.firstName || u.first_name || u.name || "")
        setLastName(u.lastName || u.last_name || "")
        setEmail(u.email || "")
        setPhone(u.phone || "")

        if (u.id && token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${u.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              if (data) {
                setFirstName(prev => data.first_name || prev)
                setLastName(prev => data.last_name || prev)
                setEmail(prev => data.email || prev)
                setPhone(prev => data.phone || prev)
              }
            })
            .catch(console.error)
        }
      } catch (e) {
        console.error("Error parsing user data")
      }
    }
  }, [])

  const calculations = useMemo(() => {
    const price = Number(vehicle?.precio || 0)
    const downPayment = Number(downPaymentValue || 0)
    const minDownPayment = price * 0.15
    const financedAmount = price - downPayment
    const monthlyRate = monthlyRates[months]
    const monthlyPayment = calculateMonthlyPayment(financedAmount, monthlyRate, months)
    const totalPaid = downPayment + monthlyPayment * months
    const estimatedInterest = totalPaid - price

    return {
      price,
      downPayment,
      minDownPayment,
      financedAmount,
      monthlyRate,
      monthlyPayment,
      totalPaid,
      estimatedInterest,
    }
  }, [downPaymentValue, months, vehicle?.precio])

  if (loading) return <LoadingState label="Calculando opciones de financiacion..." />
  if (error || !vehicle) return <ErrorState message={error || "No hay informacion del vehiculo"} vehicleId={vehicleId} />

  const financingError =
    calculations.downPayment < calculations.minDownPayment
      ? "La cuota inicial debe ser minimo el 15% del valor del vehiculo."
      : calculations.downPayment >= calculations.price
        ? "La cuota inicial debe ser menor al precio del vehiculo."
        : ""

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !document.trim() || !email.trim() || !phone.trim() || !downPaymentValue.trim()) {
      setFormError("Completa tus datos y la cuota inicial para enviar la solicitud.")
      return
    }

    if (financingError) {
      setFormError(financingError)
      return
    }

    setFormError("")
    setSuccess(true)
  }

  if (success) {
    return (
      <FlowShell title="Financiacion" subtitle="Solicitud enviada" vehicleId={vehicleId}>
        <SuccessCard
          title="Solicitud enviada"
          message="Solicitud de financiación enviada exitosamente. Un asesor revisará tus datos y te contactará próximamente."
          vehicleId={vehicleId}
        />
      </FlowShell>
    )
  }

  return (
    <FlowShell title="Financiacion" subtitle="Calculadora de cuota estimada" vehicleId={vehicleId}>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <VehicleSummaryCard vehicle={vehicle} />

        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                <Calculator className="h-6 w-6 text-blue-600" />
                Calculadora de financiacion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-800">
                La cuota inicial minima es el 15% del valor del vehiculo: {formatCurrency(calculations.minDownPayment)}.
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cuota inicial</Label>
                  <Input
                    type="number"
                    min="0"
                    value={downPaymentValue}
                    onChange={(event) => setDownPaymentValue(event.target.value)}
                    className="h-11 rounded-xl bg-white"
                    placeholder={Math.round(calculations.minDownPayment).toString()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plazo</Label>
                  <Select value={String(months)} onValueChange={(value) => setMonths(Number(value))}>
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[12, 24, 36, 48, 64].map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option} meses
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {financingError && downPaymentValue && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{financingError}</p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Precio del vehiculo" value={formatCurrency(calculations.price)} />
                <Metric label="Cuota inicial ingresada" value={formatCurrency(calculations.downPayment)} />
                <Metric label="Monto financiado" value={formatCurrency(Math.max(calculations.financedAmount, 0))} />
                <Metric label="Plazo seleccionado" value={`${months} meses`} />
                <Metric label="Tasa mensual referencial" value={`${(calculations.monthlyRate * 100).toFixed(1)}%`} />
                <Metric label="Pago mensual estimado" value={formatCurrency(calculations.monthlyPayment)} highlight />
                <Metric label="Total estimado pagado" value={formatCurrency(calculations.totalPaid)} />
                <Metric label="Total intereses estimado" value={formatCurrency(Math.max(calculations.estimatedInterest, 0))} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                <BadgePercent className="h-6 w-6 text-blue-600" />
                Datos del solicitante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Nombre" value={firstName} onChange={setFirstName} />
                  <TextField label="Apellido" value={lastName} onChange={setLastName} />
                  <TextField label="Documento" value={document} onChange={setDocument} />
                  <TextField label="Correo" type="email" value={email} onChange={setEmail} />
                  <div className="col-span-full sm:col-span-2">
                    <TextField label="Numero de telefono" value={phone} onChange={setPhone} />
                  </div>
                </div>

                {formError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</p>}

                <Button
                  type="submit"
                  disabled={Boolean(financingError)}
                  className="h-12 w-full rounded-xl bg-blue-600 text-base font-bold hover:bg-blue-700"
                >
                  <Send className="h-5 w-5" />
                  Enviar solicitud
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </FlowShell>
  )
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl bg-white" />
    </div>
  )
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
      <p className={highlight ? "text-xl font-black text-blue-600" : "font-bold text-slate-950"}>{value}</p>
    </div>
  )
}
