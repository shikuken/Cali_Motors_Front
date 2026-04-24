import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans home-page">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="max-w-md text-2xl text-white drop-shadow-md text-pretty" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
           Tu mercado de vehiculos de confianza. Encuentra tu próximo auto con nosotros. Explora, compara y compra con facilidad. Tu viaje comienza aquí.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button>Iniciar sesión</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline">Crear Cuenta</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
