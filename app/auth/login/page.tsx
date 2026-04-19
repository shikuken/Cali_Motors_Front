'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        setError(errorText || 'Correo o contraseña incorrectos.')
        return
      }

      const data = await response.json()

      // Guardamos info básica de sesión en localStorage para persistencia simple
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      // Redirección a la página protegida
      router.push('/protected')
    } catch (err: any) {
      console.error("Login Error:", err)
      setError('Ocurrió un error al intentar iniciar sesión.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Sección Izquierda: Formulario de Login */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Cali Motors</h1>
            <p className="text-balance text-muted-foreground">
              Bienvenido de vuelta. Inicia sesión para continuar y descubrir lo mejor en automoción.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2 text-left">
                <Label htmlFor="email" className="font-semibold text-foreground">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="motor@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg bg-muted/50 transition-colors focus:bg-background h-12"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-semibold text-foreground">
                    Contraseña
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg bg-muted/50 transition-colors focus:bg-background h-12"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-4">
              ¿No tienes una cuenta?{' '}
              <a
                href="/auth/sign-up"
                className="font-semibold text-primary hover:underline underline-offset-4 transition-all"
              >
                Regístrate ahora
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Sección Derecha: Imagen destacada (Split screen) */}
      <div className="relative hidden w-full lg:block overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/30 to-transparent z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop"
          alt="Deportivo oscuro elegante en Cali Motors"
          className="h-full w-full object-cover transition-transform duration-[20s] hover:scale-110 ease-linear"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
          <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm backdrop-blur-md">
            ✨ Acceso Exclusivo
          </div>
          <h2 className="text-4xl font-bold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
            Descubre tu próxima aventura<br />sobre ruedas.
          </h2>
          <p className="mt-4 text-lg text-zinc-300 max-w-xl font-light">
            Únete a nuestra plataforma y accede a nuestro inventario exclusivo de vehículos deportivos y de lujo. La excelencia nos define.
          </p>
        </div>
      </div>
    </div>
  )
}
