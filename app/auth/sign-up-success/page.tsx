import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Gracias por registrarte en CaliMotors - Tu aventura comienza aqui
              </CardTitle>
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tu&apos;Haz iniciado sesión correctamente. Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.
                Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
