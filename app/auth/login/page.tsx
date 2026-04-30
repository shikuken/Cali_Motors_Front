'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Car, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'

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

      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      router.push('/protected')
    } catch (err: any) {
      console.error("Login Error:", err)
      setError('Ocurrió un error al intentar iniciar sesión.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-svh overflow-hidden bg-slate-950 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="relative flex items-center justify-center px-6 py-10 md:px-12 lg:px-16">
        <div className="absolute inset-0 animated-gradient bg-[radial-gradient(circle_at_20%_15%,rgba(37,99,235,0.28),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(14,165,233,0.22),transparent_30%),linear-gradient(135deg,#020617,#0f172a_52%,#111827)]" />
        <div className="relative z-10 w-full max-w-md fade-up">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg shadow-blue-500/20">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="font-black tracking-tight">Cali Motors</p>
              <p className="text-xs text-slate-300">Acceso seguro</p>
            </div>
          </Link>

          <Card className="rounded-[2rem] border-white/10 bg-white/95 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-7">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  <ShieldCheck className="h-4 w-4" />
                  Marketplace protegido
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950">Bienvenido de vuelta</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Inicia sesión para explorar vehículos, publicar anuncios y gestionar tu perfil.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="motor@ejemplo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-2xl bg-slate-50 pl-10 soft-focus-ring"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-2xl bg-slate-50 pl-10 soft-focus-ring"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-2xl bg-blue-600 text-base font-bold shadow-xl shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verificando credenciales
                    </>
                  ) : (
                    <>
                      Iniciar sesión
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-slate-500">
                  ¿No tienes una cuenta?{' '}
                  <Link href="/auth/sign-up" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    Regístrate ahora
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop"
          alt="Vehiculo deportivo elegante"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-md">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-200">Cali Motors</p>
          <h2 className="max-w-xl text-4xl font-black tracking-tight">
            Vehículos, compradores y vendedores en un solo lugar.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-200">
            Una experiencia diseñada para evaluar opciones con claridad y avanzar con confianza.
          </p>
        </div>
      </section>
    </div>
  )
}
