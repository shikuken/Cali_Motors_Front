import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center font-sans overflow-hidden">
      <Image
        src="/imagen mejor.png"
        alt="Cali Motors Background"
        fill
        priority
        quality={100}
        className="absolute inset-0 object-cover -z-10"
      />
      <div className="absolute inset-0 bg-black/40 -z-10" />
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-16 text-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <p className="max-w-md text-white text-pretty" style={{fontSize: '0.875rem'}}>
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
