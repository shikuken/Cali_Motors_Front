"use client"

import Image from "next/image"
import { useSignOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import useSWR from "swr"
import {
  Bell,
  CarFront,
  CircleDollarSign,
  Eye,
  LayoutDashboard,
  MessageCircle,
  MoreVertical,
  Settings,
  Tag,
} from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value)
}

function getFirstName(email?: string) {
  if (!email) return "Usuario"
  const raw = email.split("@")[0]?.split(/[._-]/)[0] || "Usuario"
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

const salesHistory = [
  { month: "Ene", value: 22000 },
  { month: "Feb", value: 36000 },
  { month: "Mar", value: 42000 },
  { month: "Abr", value: 61000 },
  { month: "May", value: 54000 },
  { month: "Jun", value: 68000 },
]

const recentActivity = [
  { id: 1, text: "Nuevo mensaje sobre BMW Serie 5", time: "Hace 5 minutos", icon: MessageCircle, tone: "text-blue-500" },
  { id: 2, text: "Tu anuncio de Tesla Model 3 recibió 50 vistas", time: "Hace 1 hora", icon: Eye, tone: "text-green-500" },
  { id: 3, text: "Nueva oferta por Porsche 911: $92,000", time: "Hace 2 horas", icon: CircleDollarSign, tone: "text-amber-500" },
  { id: 4, text: "Pregunta sobre Mercedes-Benz Clase C", time: "Hace 3 horas", icon: MessageCircle, tone: "text-blue-500" },
  { id: 5, text: "Tu publicación de Toyota RAV4 fue verificada", time: "Hace 5 horas", icon: Bell, tone: "text-violet-500" },
  { id: 6, text: "Ford F-150 alcanzó 1,000 visualizaciones", time: "Hace 1 día", icon: Eye, tone: "text-green-500" },
]

const vehicles = [
  {
    id: 1,
    title: "BMW Serie 5 2023",
    year: "2023",
    km: "15,000 km",
    price: "$45,000",
    views: "1243 vistas",
    messages: "8 mensajes",
    status: "Activo",
    statusClass: "bg-emerald-100 text-emerald-700",
    image: "/mockup/bmw-serie-5.png",
    imagePosition: "center",
  },
  {
    id: 2,
    title: "Toyota RAV4 2022",
    year: "2022",
    km: "28,500 km",
    price: "$32,500",
    views: "892 vistas",
    messages: "5 mensajes",
    status: "Activo",
    statusClass: "bg-emerald-100 text-emerald-700",
    image: "/mockup/toyota-rav4.png",
    imagePosition: "center",
  },
  {
    id: 3,
    title: "Porsche 911 2021",
    year: "2021",
    km: "12,000 km",
    price: "$95,000",
    views: "2156 vistas",
    messages: "15 mensajes",
    status: "Pendiente",
    statusClass: "bg-amber-100 text-amber-700",
    image: "/mockup/porsche-911.png",
    imagePosition: "center",
  },
  {
    id: 4,
    title: "Tesla Model 3 2024",
    year: "2024",
    km: "5,000 km",
    price: "$42,000",
    views: "1565 vistas",
    messages: "12 mensajes",
    status: "Activo",
    statusClass: "bg-emerald-100 text-emerald-700",
    image: "/mockup/tesla-model-3.png",
    imagePosition: "center top",
  },
  {
    id: 5,
    title: "Ford F-150 2020",
    year: "2020",
    km: "45,000 km",
    price: "$38,000",
    views: "756 vistas",
    messages: "4 mensajes",
    status: "Vendido",
    statusClass: "bg-slate-100 text-slate-600",
    image: "/mockup/ford-f150.png",
    imagePosition: "center",
  },
  {
    id: 6,
    title: "Mercedes-Benz Clase C 2023",
    year: "2023",
    km: "8,500 km",
    price: "$48,500",
    views: "1324 vistas",
    messages: "9 mensajes",
    status: "Activo",
    statusClass: "bg-emerald-100 text-emerald-700",
    image: "/mockup/mercedes-clase-c.png",
    imagePosition: "center 35%",
  },
]

export function DashboardContent({ user }: { user: any }) {
  const { data: stats } = useSWR("/api/dashboard/stats", fetcher)
  const handleSignOut = useSignOut()
  const dashboardData = stats?.data
  const firstName = getFirstName(user?.email)

  const statCards = [
    {
      title: "Vehículos Publicados",
      value: formatCompactNumber(dashboardData?.totalVehicles ?? 12),
      detail: `+${Math.max(2, dashboardData?.availableVehicles ?? 2)} este mes`,
      icon: CarFront,
    },
    {
      title: "Ventas Totales",
      value: formatCurrency(dashboardData?.totalRevenue ?? 245000),
      detail: "+15% vs mes anterior",
      icon: CircleDollarSign,
    },
    {
      title: "Visualizaciones",
      value: formatCompactNumber(dashboardData?.monthlySalesCount ? dashboardData.monthlySalesCount * 320 + 647 : 3847),
      detail: "+23% esta semana",
      icon: Eye,
    },
    {
      title: "Mensajes",
      value: formatCompactNumber(dashboardData?.newInquiries ?? 28),
      detail: "5 sin leer",
      icon: MessageCircle,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-slate-950">
      <header className="border-b border-slate-200 bg-[#1f1f22] px-4 py-2 text-white">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
          </div>
          <p className="hidden text-center text-sm font-semibold sm:block">Panel de usuario para compra-venta</p>
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-slate-300" />
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-48px)] grid-cols-1 lg:grid-cols-[228px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-5">
            <CarFront className="h-5 w-5" />
            <span className="text-[18px] font-semibold">AutoMarket</span>
          </div>

          <div className="px-3 py-5">
            <nav className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-xl bg-[#050a28] px-4 py-3 text-left text-sm font-medium text-white">
                <LayoutDashboard className="h-4 w-4" />
                Panel Principal
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                <CarFront className="h-4 w-4" />
                Mis Vehículos
              </button>
              <button className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                <span className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4" />
                  Mensajes
                </span>
                <span className="rounded-full bg-[#050a28] px-2 py-0.5 text-xs text-white">5</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                <Settings className="h-4 w-4" />
                Configuración
              </button>
            </nav>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Consejo del Día</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Añade fotos de alta calidad para aumentar las visitas en un 60%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="mt-6 w-full rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <main>
          <div className="flex items-center justify-end border-b border-slate-200 bg-white px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-slate-700" />
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#050a28] px-1 text-[10px] font-semibold text-white">
                  5
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-sm font-semibold text-slate-800">
                {firstName.slice(0, 1)}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1100px] space-y-8 px-6 py-6">
            <section>
              <h1 className="text-[40px] font-bold tracking-tight text-slate-950">Panel de Usuario</h1>
              <p className="mt-2 text-lg text-slate-500">Bienvenido de nuevo, {firstName}. Aquí está tu resumen de actividad.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon
                return (
                  <Card key={card.title} className="rounded-2xl border-slate-200 bg-white shadow-none">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{card.title}</p>
                          <p className="mt-8 text-[22px] font-bold tracking-tight text-slate-950">{card.value}</p>
                          <p className="mt-1 text-sm text-slate-400">{card.detail}</p>
                        </div>
                        <Icon className="mt-1 h-4 w-4 text-slate-500" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_1fr]">
              <Card className="rounded-3xl border-slate-200 bg-white shadow-none">
                <CardContent className="p-5">
                  <h2 className="mb-4 text-[28px] font-semibold tracking-tight text-slate-950">Ventas de los Últimos 6 Meses</h2>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesHistory} margin={{ left: 12, right: 12, top: 16, bottom: 0 }}>
                        <CartesianGrid vertical={true} stroke="#e5e7eb" strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                        <Tooltip
                          cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                          formatter={(value: number) => [formatCurrency(value), "Ventas"]}
                          contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#0f172a"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#0f172a" }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 bg-white shadow-none">
                <CardContent className="p-5">
                  <h2 className="mb-4 text-[28px] font-semibold tracking-tight text-slate-950">Actividad Reciente</h2>
                  <div className="space-y-5 pt-2">
                    {recentActivity.map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.id} className="flex items-start gap-3">
                          <Icon className={`mt-1 h-5 w-5 ${item.tone}`} />
                          <div>
                            <p className="text-base font-medium text-slate-900">{item.text}</p>
                            <p className="text-sm text-slate-500">{item.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[40px] font-bold tracking-tight text-slate-950">Mis Vehículos</h2>
                <Button className="h-12 rounded-xl bg-[#050a28] px-6 text-sm font-semibold hover:bg-[#0f1d52]">
                  Publicar Nuevo Vehículo
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-none">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-3xl bg-slate-100">
  <Image
    src={vehicle.image}
    alt={vehicle.title}
    fill
    sizes="(max-width: 768px) 100vw, 33vw"
    className="object-cover scale-130"
    style={{ objectPosition: vehicle.imagePosition ?? "center" }}
  />
  <span
    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${vehicle.statusClass}`}
  >
    {vehicle.status}
  </span>
</div>

                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-[18px] font-semibold text-slate-950">{vehicle.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">{vehicle.year} · {vehicle.km}</p>
                        </div>
                        <button className="text-slate-500 transition hover:text-slate-800" aria-label={`Más opciones de ${vehicle.title}`}>
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="text-[22px] font-bold tracking-tight text-slate-950">{vehicle.price}</p>

                      <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-4 w-4" />
                          {vehicle.views}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="h-4 w-4" />
                          {vehicle.messages}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <Tag className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Valor inventario</p>
                    <p className="text-xl font-bold text-slate-950">{formatCurrency(dashboardData?.totalInventoryValue ?? 301500)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <CircleDollarSign className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Ganancia neta</p>
                    <p className="text-xl font-bold text-slate-950">{formatCurrency(dashboardData?.netProfit ?? 104000)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <MessageCircle className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Clientes registrados</p>
                    <p className="text-xl font-bold text-slate-950">{formatCompactNumber(dashboardData?.totalCustomers ?? 86)}</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
