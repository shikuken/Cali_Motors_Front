import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="border-t-4 border-t-primary shadow-xl bg-card">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                ¡Gracias por registrarte!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Tu aventura con Cali Motors está a punto de comenzar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Has creado tu cuenta correctamente. Por favor, revisa tu bandeja de entrada o la carpeta de correo no deseado para <strong>confirmar tu cuenta</strong> antes de iniciar sesión.
                </p>
                <div className="pt-4 border-t border-border">
                  <a
                    href="/auth/login"
                    className="flex w-full h-12 items-center justify-center rounded-md bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Ir a Iniciar Sesión
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
