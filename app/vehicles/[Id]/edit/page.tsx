'use client'

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, ArrowLeft, Loader2, Upload, X } from "lucide-react"

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.Id as string

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
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
    estado: "Activo",
    imagen: null as File | string | null,
  })

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`http://localhost:3001/vehicles/${vehicleId}`)
        if (!response.ok) {
          throw new Error("No se pudo cargar la información del vehículo")
        }
        const data = await response.json()

        const user = localStorage.getItem("user")
        if (!user) {
          router.push("/auth/login")
          return
        }
        const userData = JSON.parse(user)
        if (data.user_id !== userData.id) {
          setError("No tienes permiso para editar este vehículo")
          return
        }

        setFormData({
          marca: data.marca || "",
          modelo: data.modelo || "",
          año: data.año || new Date().getFullYear(),
          precio: data.precio || "",
          kilometraje: data.kilometraje || "",
          descripcion: data.descripcion || "",
          estado: data.estado || "Activo",
          imagen: data.imagen || null
        })
        if (data.imagen) {
          setImagePreview(data.imagen)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setInitialLoading(false)
      }
    }

    if (vehicleId) {
      fetchVehicle()
    }
  }, [vehicleId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "año" || name === "precio" || name === "kilometraje" ? (value ? Number(value) : "") : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imagen: file,
      }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      imagen: null,
    }))
    setImagePreview(null)
  }

  const formatPrecio = (value: number | string) => {
    if (!value) return ""
    const num = Number(value)
    return num.toLocaleString("es-CO")
  }

  const formatKilometraje = (value: number | string) => {
    if (!value) return ""
    const num = Number(value)
    return num.toLocaleString("es-CO")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = localStorage.getItem("user")
      if (!user) {
        setError("Debes estar autenticado para editar un vehículo")
        router.push("/auth/login")
        return
      }

      const userData = JSON.parse(user)
      const userId = userData.id

      if (!formData.marca || !formData.modelo || !formData.año || !formData.precio) {
        setError("Completa todos los campos obligatorios")
        setLoading(false)
        return
      }

      let imagenBase64 = typeof formData.imagen === 'string' ? formData.imagen : null
      if (formData.imagen instanceof File) {
        imagenBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.readAsDataURL(formData.imagen as File)
        })
      }

      const response = await fetch(`http://localhost:3001/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          marca: formData.marca,
          modelo: formData.modelo,
          año: formData.año,
          precio: formData.precio,
          kilometraje: formData.kilometraje || 0,
          descripcion: formData.descripcion,
          estado: formData.estado,
          imagen: imagenBase64,
        }),
      })

      let data;
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = { error: text || "Error desconocido del servidor" }
      }

      if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}`)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/protected")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500 mb-4" />
          <p className="text-slate-600">Cargando información del vehículo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4 lg:px-6">
          <Link href="/protected" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Cali Motors</p>
              <p className="text-xs text-slate-500">Editar vehículo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-3xl">Editar vehículo</CardTitle>
            <CardDescription>Modifica los detalles del vehículo para mantener actualizada tu publicación</CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                <div className="mb-3 text-4xl">✓</div>
                <h3 className="text-lg font-bold text-emerald-900">¡Cambios guardados exitosamente!</h3>
                <p className="text-sm text-emerald-700 mt-1">Redirigiendo al dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección: Imagen */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900">Imagen del vehículo</h3>
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-80 object-cover rounded-xl border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-12 w-12 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-700 font-medium">Haz clic para cargar una imagen</p>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF (máx. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        name="imagen"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Sección: Información del vehículo */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900">Información del vehículo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Marca */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Marca <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="marca"
                        placeholder="Ej: Toyota, Chevrolet, Mazda"
                        value={formData.marca}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                        required
                      />
                    </div>

                    {/* Modelo */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Modelo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="modelo"
                        placeholder="Ej: Corolla, Spark, 3"
                        value={formData.modelo}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                        required
                      />
                    </div>

                    {/* Año */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Año <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="año"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.año}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                        required
                      />
                    </div>

                    {/* Precio */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Precio (COP) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                        <input
                          type="number"
                          name="precio"
                          placeholder="50000000"
                          value={formData.precio}
                          onChange={handleChange}
                          className="w-full pl-8 pr-32 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                          required
                        />
                        {formData.precio && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-600 pointer-events-none">
                            {formatPrecio(formData.precio)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Kilometraje */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kilometraje (km)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="kilometraje"
                          placeholder="120000"
                          value={formData.kilometraje}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                        />
                        {formData.kilometraje && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-600">
                            {formatKilometraje(formData.kilometraje)} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado de la publicación <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                    required
                  >
                    <option value="Activo">Activo</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Pausado">Pausado</option>
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    placeholder="Describe el estado general del vehículo, características especiales, accesorios, etc."
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition resize-none"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                  <Link href="/protected" className="flex-1">
                    <Button type="button" variant="outline" className="w-full h-12 rounded-xl">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
