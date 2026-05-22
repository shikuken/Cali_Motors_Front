'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Loader2, Banknote, Car, Calendar, Tag, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { fetchWithAuth } from "@/lib/api"
import { Button } from '@/components/ui/button'

interface Financiamiento {
  id: number
  monto_financiado: string | number
  plazo_meses: number
  estado: string
  vehicle_id: number
  marca: string
  modelo: string
  imagen: string
  precio: string | number
}

export default function MisFinanciamientosPage() {
  const router = useRouter()
  const [financiamientos, setFinanciamientos] = useState<Financiamiento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchFinanciamientos = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          router.push('/auth/login')
          return
        }

        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/financiamientos`)
        if (!response.ok) {
          throw new Error('No se pudieron cargar los financiamientos')
        }
        
        const data = await response.json()
        setFinanciamientos(data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar financiamientos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinanciamientos()
  }, [router])

  const formatCurrency = (value: string | number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(value))

  const getStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'confirmado':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case 'denegado':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'confirmado':
        return "bg-emerald-950/30 text-emerald-400 border-emerald-800"
      case 'denegado':
        return "bg-red-950/30 text-red-400 border-red-800"
      default:
        return "bg-blue-950/30 text-blue-400 border-blue-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#111827_46%,#0f172a_100%)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700">
            <Link href="/protected">
              <ArrowLeft className="h-5 w-5 text-slate-300" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-100">Mis Financiamientos</h1>
            <p className="text-sm text-slate-400 mt-1">Sigue el estado de tus solicitudes de crédito vehicular.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-800 bg-red-950/30 p-4 text-sm font-medium text-red-300">
            {error}
          </div>
        )}

        {financiamientos.length === 0 && !error ? (
          <Card className="rounded-[2rem] border-dashed border-slate-700 bg-slate-900/50 text-center shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15">
                <Banknote className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Aún no tienes solicitudes</h3>
              <p className="mt-2 text-slate-400 max-w-sm">
                Cuando solicites financiamiento para un vehículo, el estado y los detalles aparecerán aquí.
              </p>
              <Button asChild className="mt-6 rounded-xl bg-blue-600 font-bold hover:bg-blue-700">
                <Link href="/protected">Explorar vehículos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {financiamientos.map((fin) => (
              <Card key={fin.id} className="overflow-hidden rounded-[2rem] border-slate-800 bg-slate-900 shadow-lg shadow-slate-950/40 transition-shadow hover:shadow-xl hover:shadow-slate-950/60">
                <div className="flex flex-col sm:flex-row">
                  {/* Imagen del vehículo */}
                  <div className="relative h-48 w-full sm:h-auto sm:w-64 shrink-0 bg-slate-800">
                    {fin.imagen ? (
                      <img src={fin.imagen} alt={`${fin.marca} ${fin.modelo}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Car className="h-12 w-12 text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-100 line-clamp-1">
                          {fin.marca} {fin.modelo}
                        </h3>
                        <p className="text-sm font-medium text-slate-400">
                          Valor total: {formatCurrency(fin.precio)}
                        </p>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(fin.estado)}`}>
                        {getStatusIcon(fin.estado)}
                        {fin.estado}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-auto rounded-2xl bg-slate-800 p-4 border border-slate-700">
                      <div>
                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Banknote className="h-3.5 w-3.5" /> Monto financiado
                        </p>
                        <p className="text-lg font-bold text-slate-100">{formatCurrency(fin.monto_financiado)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Plazo
                        </p>
                        <p className="text-lg font-bold text-slate-100">{fin.plazo_meses} meses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
