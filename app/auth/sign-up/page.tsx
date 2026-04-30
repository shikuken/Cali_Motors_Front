'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Car, Loader2, ShieldCheck, UserPlus } from 'lucide-react'

const COUNTRY_PREFIXES = [
  { code: '+1', flag: 'US', name: 'EE.UU.' },
  { code: '+1', flag: 'CA', name: 'Canada' },
  { code: '+52', flag: 'MX', name: 'Mexico' },
  { code: '+54', flag: 'AR', name: 'Argentina' },
  { code: '+55', flag: 'BR', name: 'Brasil' },
  { code: '+56', flag: 'CL', name: 'Chile' },
  { code: '+57', flag: 'CO', name: 'Colombia' },
  { code: '+51', flag: 'PE', name: 'Peru' },
  { code: '+58', flag: 'VE', name: 'Venezuela' },
  { code: '+593', flag: 'EC', name: 'Ecuador' },
  { code: '+591', flag: 'BO', name: 'Bolivia' },
  { code: '+595', flag: 'PY', name: 'Paraguay' },
  { code: '+598', flag: 'UY', name: 'Uruguay' },
  { code: '+34', flag: 'ES', name: 'Espana' },
  { code: '+44', flag: 'GB', name: 'Reino Unido' },
  { code: '+33', flag: 'FR', name: 'Francia' },
  { code: '+49', flag: 'DE', name: 'Alemania' },
  { code: '+39', flag: 'IT', name: 'Italia' },
  { code: '+351', flag: 'PT', name: 'Portugal' },
  { code: '+7', flag: 'RU', name: 'Rusia' },
  { code: '+86', flag: 'CN', name: 'China' },
  { code: '+91', flag: 'IN', name: 'India' },
  { code: '+81', flag: 'JP', name: 'Japon' },
  { code: '+82', flag: 'KR', name: 'Corea del Sur' },
  { code: '+61', flag: 'AU', name: 'Australia' },
]

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phonePrefix, setPhonePrefix] = useState('+57')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!email || !password || !repeatPassword || !firstName || !lastName || !phoneNumber) {
      setError('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone: `${phonePrefix}${phoneNumber}`,
          acceptTerms: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el usuario')
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        localStorage.setItem('user', JSON.stringify({
          id: data.userId,
          email,
          firstName,
          lastName,
        }))
      }

      router.push('/protected')
    } catch (error: any) {
      setError(error.message || 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#f8fafc)] px-5 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.82fr_1fr]">
        <section className="fade-up hidden lg:block">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 text-slate-950">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-blue-500/20">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="font-black">Cali Motors</p>
              <p className="text-xs text-slate-500">Registro de usuarios</p>
            </div>
          </Link>
          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-950">
            Crea tu cuenta y empieza a moverte mejor.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            Publica vehiculos, explora el inventario y gestiona tus datos desde una experiencia clara y segura.
          </p>
          <div className="mt-8 grid max-w-lg gap-3">
            {['Marketplace organizado', 'Datos protegidos por autenticacion', 'Gestion de publicaciones'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-lg shadow-slate-200/60">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <Card className="float-in rounded-[2rem] border-white/80 bg-white/95 shadow-2xl shadow-slate-300/60 backdrop-blur">
          <CardContent className="p-6 sm:p-8">
            <Button asChild variant="ghost" className="mb-5 rounded-xl px-0 text-slate-500 hover:bg-transparent hover:text-slate-950">
              <Link href="/auth/login">
                <ArrowLeft className="h-4 w-4" />
                Ya tengo cuenta
              </Link>
            </Button>

            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                <UserPlus className="h-4 w-4" />
                Nuevo usuario
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">Crear cuenta</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Completa tus datos para acceder al marketplace.</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="firstName" label="Nombre" value={firstName} onChange={setFirstName} placeholder="Juan" />
                <Field id="lastName" label="Apellido" value={lastName} onChange={setLastName} placeholder="Perez" />
              </div>

              <Field id="email" label="Correo electronico" value={email} onChange={setEmail} type="email" placeholder="m@example.com" />

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Numero de telefono</Label>
                <div className="flex gap-2">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="h-12 w-[118px] shrink-0 rounded-2xl border border-input bg-slate-50 px-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                  >
                    {COUNTRY_PREFIXES.map((country, index) => (
                      <option key={`${country.flag}-${country.code}-${country.name}-${index}`} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="300 123 4567"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
                    className="h-12 flex-1 rounded-2xl bg-slate-50 soft-focus-ring"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="password" label="Contraseña" value={password} onChange={setPassword} type="password" />
                <Field id="repeat-password" label="Repetir contraseña" value={repeatPassword} onChange={setRepeatPassword} type="password" />
              </div>

              {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

              <Button type="submit" className="h-12 w-full rounded-2xl bg-blue-600 text-base font-bold shadow-xl shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando cuenta
                  </>
                ) : (
                  <>
                    Registrarme
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl bg-slate-50 soft-focus-ring"
      />
    </div>
  )
}
