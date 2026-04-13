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

const COUNTRY_PREFIXES = [
  { code: '+1', flag: '🇺🇸', name: 'EE.UU.' },
  { code: '+1', flag: '🇨🇦', name: 'Canadá' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: '+33', flag: '🇫🇷', name: 'Francia' },
  { code: '+49', flag: '🇩🇪', name: 'Alemania' },
  { code: '+39', flag: '🇮🇹', name: 'Italia' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+7', flag: '🇷🇺', name: 'Rusia' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+81', flag: '🇯🇵', name: 'Japón' },
  { code: '+82', flag: '🇰🇷', name: 'Corea del Sur' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
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

    // Validaciones locales
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

      // Guardar datos del usuario en localStorage (opcional)
      localStorage.setItem('user', JSON.stringify({ 
        id: data.userId,
        email, 
        firstName, 
        lastName,
      }))

      router.push('/auth/sign-up-success')
    } catch (error: any) {
      setError(error.message || 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
              <CardDescription>Regístrate para acceder a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Juan"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Pérez"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phoneNumber">Número de teléfono</Label>
                    <div className="flex gap-2">
                      <select
                        value={phonePrefix}
                        onChange={(e) => setPhonePrefix(e.target.value)}
                        className="flex h-9 w-[120px] shrink-0 items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {COUNTRY_PREFIXES.map((country) => (
                          <option
                            key={`${country.flag}-${country.code}-${country.name}`}
                            value={country.code}
                          >
                            {country.flag} {country.code} {country.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="300 123 4567"
                        required
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value.replace(/[^0-9\s]/g, ''))
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Repetir Contraseña</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/auth/login" className="underline underline-offset-4">
                    Iniciar Sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}