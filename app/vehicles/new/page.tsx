'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Car, ArrowLeft, CheckCircle2, Loader2, Upload, X } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"

export default function PublishVehiclePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    precio: "",
    kilometraje: "",
    descripcion: "",
    imagen: null as File | null,
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "año" || name === "precio" || name === "kilometraje" ? (value ? Number(value) : "") : value,
    }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFormData((prev) => ({ ...prev, imagen: file }))
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imagen: null }))
    setImagePreview(null)
  }

  const formatNumber = (value: number | string) => {
    if (!value) return ""
    return Number(value).toLocaleString("es-CO")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = localStorage.getItem("user")
      if (!user) {
        setError("Debes estar autenticado para publicar un vehiculo")
        router.push("/auth/login")
        return
      }

      const userData = JSON.parse(user)

      if (!formData.marca || !formData.modelo || !formData.año || !formData.precio) {
        setError("Completa todos los campos obligatorios")
        setLoading(false)
        return
      }

      let imagenBase64 = null
      if (formData.imagen) {
        imagenBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(formData.imagen!)
        })
      }

      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          marca: formData.marca,
          modelo: formData.modelo,
          año: formData.año,
          precio: formData.precio,
          kilometraje: formData.kilometraje || 0,
          descripcion: formData.descripcion,
          imagen: imagenBase64,
        }),
      })

      let data
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = { error: text || "Error desconocido del servidor" }
      }

      if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`)

      setSuccess(true)
      setTimeout(() => router.push("/protected"), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar el vehiculo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] pb-12 dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_48%,#0f172a_100%)]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 lg:px-6">
          <Button asChild variant="ghost" className="rounded-xl text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            <Link href="/protected">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-blue-600/20">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-950 dark:text-white">Cali Motors</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Publicar vehiculo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-6">
        <aside className="space-y-4">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/60 dark:bg-slate-900 dark:shadow-slate-950/20">
            <p className="mb-2 text-sm font-bold text-blue-200">Nueva publicacion</p>
            <h1 className="text-3xl font-black tracking-tight">Muestra tu vehiculo con mejor presencia.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Fotos claras, precio visible y datos completos ayudan a que los compradores comparen mas rapido.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-950 dark:text-slate-100">Resumen</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <SummaryRow label="Marca" value={formData.marca || "Pendiente"} />
              <SummaryRow label="Modelo" value={formData.modelo || "Pendiente"} />
              <SummaryRow label="Precio" value={formData.precio ? `$${formatNumber(formData.precio)}` : "Pendiente"} />
            </div>
          </div>
        </aside>

        <Card className="rounded-[2rem] border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
          <CardContent className="p-6 sm:p-8">
            {success ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600 dark:text-emerald-300" />
                <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-100">Vehiculo publicado exitosamente</h3>
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">Redirigiendo al tablero...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                <section>
                  <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-slate-100">Imagen del vehiculo</h2>
                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
                      <img src={imagePreview} alt="Vista previa" className="h-80 w-full object-cover" />
                      <button type="button" onClick={removeImage} className="absolute right-4 top-4 rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:bg-red-600">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:bg-slate-800">
                      <Upload className="mb-3 h-12 w-12 text-slate-400" />
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Haz clic para cargar una imagen</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PNG, JPG o WEBP</p>
                      <input type="file" name="imagen" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </section>

                <section>
                  <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-slate-100">Informacion del vehiculo</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Marca" name="marca" value={formData.marca} onChange={handleChange} placeholder="Ej: Toyota, Chevrolet, Mazda" required />
                    <Field label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Ej: Corolla, Spark, 3" required />
                    <Field label="Ano" name="año" type="number" min="1900" max={new Date().getFullYear()} value={formData.año} onChange={handleChange} required />
                    <Field label="Precio (COP)" name="precio" type="number" value={formData.precio} onChange={handleChange} placeholder="50000000" required helper={formData.precio ? `$${formatNumber(formData.precio)}` : ""} />
                    <Field label="Kilometraje (km)" name="kilometraje" type="number" value={formData.kilometraje} onChange={handleChange} placeholder="120000" helper={formData.kilometraje ? `${formatNumber(formData.kilometraje)} km` : ""} />
                  </div>
                </section>

                <section>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Descripcion</label>
                  <textarea
                    name="descripcion"
                    placeholder="Describe estado general, caracteristicas, mantenimientos y accesorios."
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  />
                </section>

                {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <Button asChild type="button" variant="outline" className="h-12 flex-1 rounded-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    <Link href="/protected">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={loading} className="h-12 flex-1 rounded-2xl bg-blue-600 font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</> : "Publicar vehiculo"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
      <span>{label}</span>
      <span className="font-bold text-slate-950 dark:text-slate-100">{value}</span>
    </div>
  )
}

function Field({
  label,
  helper,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  helper?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
        />
        {helper && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 dark:text-slate-400">{helper}</span>}
      </div>
    </div>
  )
}
