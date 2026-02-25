import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance">
            CaliMotors
          </h1>
          <p className="max-w-md text-lg text-muted-foreground text-pretty">
           Cali Motors, Tu mercado de vehiculos de confianza. Encuentra tu próximo auto con nosotros. Explora, compara y compra con facilidad. Tu viaje comienza aquí.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button>Sign In</Button>
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
