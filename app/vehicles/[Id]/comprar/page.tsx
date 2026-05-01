'use client'

import { FormEvent, useState, useEffect } from "react"
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
import { CreditCard, FileCheck2, ShieldCheck } from "lucide-react"
import {
  ErrorState,
  FlowShell,
  formatCurrency,
  LoadingState,
  SuccessCard,
  useVehicle,
  VehicleSummaryCard,
} from "../_components/vehicle-flow-shared"

const initialForm = {
  firstName: "",
  lastName: "",
  document: "",
  email: "",
  phoneNum: "",
  paymentMethod: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
}

export default function ComprarVehiclePage() {
  const params = useParams()
  const vehicleId = params.Id as string
  const { loading, vehicle, error } = useVehicle(vehicleId)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser)
        setForm((f) => ({
          ...f,
          firstName: u.firstName || u.first_name || u.name || "",
          lastName: u.lastName || u.last_name || "",
          email: u.email || "",
          phoneNum: u.phone || "",
        }))

        if (u.id && token) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${u.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              if (data) {
                setForm((f) => ({
                  ...f,
                  firstName: data.first_name || f.firstName,
                  lastName: data.last_name || f.lastName,
                  email: data.email || f.email,
                  phoneNum: data.phone || f.phoneNum,
                }))
              }
            })
            .catch(console.error)
        }
      } catch (e) {
        console.error("Error parsing user data")
      }
    }
  }, [])

  if (loading) return <LoadingState label="Preparando resumen de compra..." />
  if (error || !vehicle) return <ErrorState message={error || "No hay informacion del vehiculo"} vehicleId={vehicleId} />

  const price = Number(vehicle.precio || 0)
  const requiredFields = Object.entries(form)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const hasEmptyField = requiredFields.some(([, value]) => !value.trim())
    if (hasEmptyField) {
      setFormError("Completa todos los campos principales para continuar.")
      return
    }

    setFormError("")
    setSuccess(true)
  }

  if (success) {
    return (
      <FlowShell title="Compra de vehiculo" subtitle="Solicitud completada" vehicleId={vehicleId}>
        <SuccessCard
          title="Compra realizada exitosamente"
          message="Compra realizada exitosamente. Te enviaremos un correo en las próximas 2 horas con la información de tu compra y el proceso de traspaso."
          vehicleId={vehicleId}
        />
      </FlowShell>
    )
  }

  return (
    <FlowShell title="Compra de vehiculo" subtitle="Checkout seguro" vehicleId={vehicleId}>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <VehicleSummaryCard vehicle={vehicle} showDescription />

        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                <FileCheck2 className="h-6 w-6 text-blue-600" />
                Resumen de compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SummaryLine label="Vehiculo" value={`${vehicle.marca || "Vehiculo"} ${vehicle.modelo || ""}`} />
              <SummaryLine label="Estado" value={vehicle.estado || "Sin estado"} />
              <SummaryLine label="Precio total" value={formatCurrency(price)} highlight />
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                Revisaremos tu solicitud y un asesor validara los siguientes pasos antes de cualquier desembolso.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                <CreditCard className="h-6 w-6 text-blue-600" />
                Datos para gestionar la compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Nombre" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} />
                  <TextField label="Apellido" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} />
                  <TextField label="Documento" value={form.document} onChange={(value) => setForm({ ...form, document: value })} />
                  <TextField label="Correo" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
                  <div className="col-span-full sm:col-span-2">
                    <TextField label="Numero de telefono" value={form.phoneNum} onChange={(value) => setForm({ ...form, phoneNum: value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Metodo de pago preferido</Label>
                  <Select value={form.paymentMethod} onValueChange={(value) => setForm({ ...form, paymentMethod: value })}>
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Selecciona un metodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tarjeta-credito">Tarjeta de credito</SelectItem>
                      <SelectItem value="tarjeta-debito">Tarjeta debito</SelectItem>
                      <SelectItem value="transferencia">Transferencia bancaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr_0.4fr]">
                  <TextField label="Numero de la tarjeta" value={form.cardNumber} onChange={(value) => setForm({ ...form, cardNumber: value })} />
                  <TextField label="Fecha de expiracion de la tarjeta" placeholder="MM/AA" value={form.expiry} onChange={(value) => setForm({ ...form, expiry: value })} />
                  <TextField label="CVV" value={form.cvv} onChange={(value) => setForm({ ...form, cvv: value })} />
                </div>

                {formError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</p>}

                <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 text-base font-bold hover:bg-blue-700">
                  <ShieldCheck className="h-5 w-5" />
                  Confirmar solicitud de compra
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
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl bg-white"
      />
    </div>
  )
}

function SummaryLine({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={highlight ? "text-xl font-black text-blue-600" : "font-bold text-slate-950"}>{value}</span>
    </div>
  )
}
