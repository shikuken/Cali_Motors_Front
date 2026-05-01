import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, ShieldCheck, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-white">
      <Image
        src="/imagen mejor.png"
        alt="Cali Motors"
        fill
        priority
        quality={100}
        className="absolute inset-0 object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.45),transparent_34%),linear-gradient(110deg,rgba(2,6,23,0.95)_0%,rgba(15,23,42,0.72)_48%,rgba(15,23,42,0.25)_100%)]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg shadow-blue-500/20">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-black tracking-tight">Cali Motors</p>
            <p className="text-xs text-slate-300">Marketplace de vehiculos</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden rounded-xl text-white hover:bg-white/10 hover:text-white sm:inline-flex">
            <Link href="/auth/login">Iniciar sesion</Link>
          </Button>
          <Button asChild className="rounded-xl bg-white text-slate-950 shadow-lg shadow-white/10 hover:bg-blue-50">
            <Link href="/auth/sign-up">Crear cuenta</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-center gap-10 px-5 pb-14 pt-10 lg:grid-cols-[1fr_0.72fr] lg:px-8">
        <section className="fade-up max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-50 backdrop-blur">
            <Sparkles className="h-4 w-4 text-blue-200" />
            Vehiculos seleccionados, vendedores verificados y una experiencia mas clara
          </div>
          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Encuentra el vehiculo que encaja con tu proximo camino.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            Explora, compara y conecta con vendedores en un marketplace moderno para comprar o publicar vehiculos con confianza.
          </p>


        </section>

        <aside className="float-in hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-slate-950/40 backdrop-blur-md lg:block">
          <div className="rounded-[1.5rem] bg-white p-5 text-slate-950">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Experiencia Cali Motors</p>
                <p className="text-2xl font-black">Compra con criterio</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="grid gap-3">
              {[
                ["Catalogo visual", "Fotos, precio, kilometraje y estado visibles desde el primer vistazo."],
                ["Acciones claras", "Compra, financiacion y SOAT organizados desde el detalle."],
                ["Gestion simple", "Publica, edita y administra tus vehiculos desde un solo tablero."],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
