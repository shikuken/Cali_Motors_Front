'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useMemo, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Car, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'

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

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const clamped = Math.min(score, 4)
  const levels = [
    { label: '', color: '' },
    { label: 'Muy débil', color: 'text-red-600' },
    { label: 'Débil', color: 'text-orange-500' },
    { label: 'Media', color: 'text-yellow-500' },
    { label: 'Fuerte', color: 'text-green-600' },
  ]
  return { score: clamped, ...levels[clamped] }
}

const validators: Record<string, (v: string, ctx?: Record<string, string>) => string | null> = {
  firstName: (v) => v.trim().length < 2 ? 'Mínimo 2 caracteres' : null,
  lastName: (v) => v.trim().length < 2 ? 'Mínimo 2 caracteres' : null,
  documento: (v) => !/^\d{6,10}$/.test(v.trim()) ? 'Entre 6 y 10 dígitos numéricos' : null,
  email: (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Correo inválido' : null,
  phoneNumber: (v) => v.replace(/\s/g, '').length < 7 ? 'Número muy corto' : null,
  password: (v) => !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v)
    ? 'Mínimo 8 caracteres, una mayúscula, un número y un carácter especial' : null,
  repeatPassword: (v, ctx) => v !== ctx?.password ? 'Las contraseñas no coinciden' : null,
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

function inputClass(touched: boolean, error: string | null): string {
  const base = 'h-10 rounded-2xl bg-slate-50 text-slate-900 placeholder:text-slate-400 soft-focus-ring pr-10 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500'
  if (!touched) return base
  if (error) return `${base} border-red-400 focus-visible:ring-red-200`
  return `${base} border-green-400 focus-visible:ring-green-200`
}

function FieldMsg({ show, error }: { show: boolean; error: string | null }) {
  if (!show) return null
  if (error) return (
    <p className="flex items-center gap-1 text-[10px] font-medium text-red-500">
      <XCircle className="h-3 w-3 shrink-0" />{error}
    </p>
  )
  return (
    <p className="flex items-center gap-1 text-[10px] font-medium text-green-600">
      <CheckCircle2 className="h-3 w-3 shrink-0" />Correcto
    </p>
  )
}

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}

export default function Page() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [documento, setDocumento] = useState('')
  const [email, setEmail] = useState('')
  const [phonePrefix, setPhonePrefix] = useState('+57')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPass, setShowPass] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const ctx = { password }
  const fieldErrors: Record<string, string | null> = {
    firstName: validators.firstName(firstName),
    lastName: validators.lastName(lastName),
    documento: validators.documento(documento),
    email: validators.email(email),
    phoneNumber: validators.phoneNumber(phoneNumber),
    password: validators.password(password),
    repeatPassword: validators.repeatPassword(repeatPassword, ctx),
  }

  const isFormValid =
    Object.values(fieldErrors).every((e) => e === null) &&
    [firstName, lastName, documento, email, phoneNumber, password, repeatPassword].every(Boolean)

  const touch = useCallback((field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true })), [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(Object.fromEntries(Object.keys(fieldErrors).map((k) => [k, true])))
    if (!isFormValid) {
      setError('Por favor corrige los errores antes de continuar')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          documento,
          phone: `${phonePrefix}${phoneNumber.replace(/\s/g, '')}`,
          acceptTerms: true,
        }),
      })

      // Leer el cuerpo como texto primero para manejar respuestas no-JSON (HTML de error)
      const rawText = await response.text()

      if (!response.ok) {
        let message = 'Error al registrar el usuario'
        try {
          const errorData = JSON.parse(rawText)
          message = errorData.message || message
        } catch {
          // El servidor devolvió texto plano o HTML; usar mensaje genérico
          message = rawText.startsWith('<') ? message : rawText || message
        }
        throw new Error(message)
      }

      const data = JSON.parse(rawText)
      if (data.token) localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(
        data.user ?? { id: data.userId, email, firstName, lastName }
      ))
      router.push('/protected')
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#f8fafc)] px-5 py-4 dark:bg-none dark:bg-slate-950">
      <div className="mx-auto grid h-full max-w-6xl items-center gap-8 lg:grid-cols-[0.82fr_1fr]">

        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <section className="fade-up hidden lg:block">
          <Link href="/" className="mb-5 inline-flex items-center gap-3 text-slate-950 dark:text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-blue-500/20 dark:bg-blue-600">
              <Car className="h-4 w-4" />
            </div>
            <div>
              <p className="font-black">Cali Motors</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Registro de usuarios</p>
            </div>
          </Link>
          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white">
            Crea tu cuenta y empieza a moverte mejor.
          </h1>
          <p className="mt-3 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-400">
            Publica vehiculos, explora el inventario y gestiona tus datos desde una experiencia clara y segura.
          </p>
          <div className="mt-5 grid max-w-lg gap-2">
            {['Marketplace organizado', 'Datos protegidos por autenticacion', 'Gestion de publicaciones'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-lg shadow-slate-200/60 dark:bg-slate-800/80 dark:shadow-slate-950/20">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Formulario ──────────────────────────────────────────────────── */}
        <Card className="float-in rounded-[2rem] border-white/80 bg-white/95 shadow-2xl shadow-slate-300/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-950/40">
          <CardContent className="p-5 sm:p-6">
            <Button asChild variant="ghost" className="mb-3 rounded-xl px-0 text-slate-500 hover:bg-transparent hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
              <Link href="/auth/login">
                <ArrowLeft className="h-4 w-4" />
                Ya tengo cuenta
              </Link>
            </Button>

            <div className="mb-4">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Crear cuenta</h2>
              <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">Completa tus datos para acceder al marketplace.</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-3" noValidate>

              {/* Nombre + Apellido */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">Nombre</Label>
                  <Input id="firstName" placeholder="Juan" required value={firstName} disabled={isLoading}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => touch('firstName')}
                    className={inputClass(!!touched.firstName, fieldErrors.firstName)}
                  />
                  <FieldMsg show={!!touched.firstName} error={fieldErrors.firstName} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300">Apellido</Label>
                  <Input id="lastName" placeholder="Perez" required value={lastName} disabled={isLoading}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => touch('lastName')}
                    className={inputClass(!!touched.lastName, fieldErrors.lastName)}
                  />
                  <FieldMsg show={!!touched.lastName} error={fieldErrors.lastName} />
                </div>
              </div>

              {/* Documento + Email */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="documento" className="text-slate-700 dark:text-slate-300">Documento de identidad</Label>
                  <Input id="documento" placeholder="1234567890" required inputMode="numeric" maxLength={10}
                    value={documento} disabled={isLoading}
                    onChange={(e) => setDocumento(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={() => touch('documento')}
                    className={inputClass(!!touched.documento, fieldErrors.documento)}
                  />
                  <FieldMsg show={!!touched.documento} error={fieldErrors.documento} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Correo electrónico</Label>
                  <Input id="email" type="email" placeholder="correo@example.com" required
                    value={email} disabled={isLoading}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => touch('email')}
                    className={inputClass(!!touched.email, fieldErrors.email)}
                  />
                  <FieldMsg show={!!touched.email} error={fieldErrors.email} />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300">Número de teléfono</Label>
                <div className="flex gap-2">
                  <select
                    value={phonePrefix} disabled={isLoading}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="h-10 w-[110px] shrink-0 rounded-2xl border border-input bg-slate-50 px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {COUNTRY_PREFIXES.map((c, i) => (
                      <option key={`${c.flag}-${c.code}-${i}`} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <div className="flex flex-1 flex-col gap-1">
                    <Input id="phoneNumber" type="tel" placeholder="300 123 4567" required inputMode="tel"
                      value={phoneNumber} disabled={isLoading}
                      onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                      onBlur={() => touch('phoneNumber')}
                      className={inputClass(!!touched.phoneNumber, fieldErrors.phoneNumber)}
                    />
                    <FieldMsg show={!!touched.phoneNumber} error={fieldErrors.phoneNumber} />
                  </div>
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid gap-3 sm:grid-cols-2">

                {/* Contraseña */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Contraseña</Label>
                    <span className="text-[10px] leading-tight text-slate-400 dark:text-slate-500">8+ car., mayúscula, número y símbolo</span>
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPass ? 'text' : 'password'} required
                      value={password} disabled={isLoading}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => touch('password')}
                      className={inputClass(!!touched.password, fieldErrors.password)}
                    />
                    <EyeToggle show={showPass} onToggle={() => setShowPass((v) => !v)} />
                  </div>
                  {/* Strength bar */}
                  <div className="space-y-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: password.length > 0 && step <= strength.score
                              ? `hsl(${((strength.score - 1) / 3) * 120}, 72%, 50%)`
                              : '#e2e8f0',
                          }}
                        />
                      ))}
                    </div>
                    {password.length > 0 && (
                      <p className={`text-[10px] font-medium ${strength.color}`}>{strength.label}</p>
                    )}
                  </div>
                </div>

                {/* Repetir contraseña */}
                <div className="space-y-1">
                  <Label htmlFor="repeat-password" className="text-slate-700 dark:text-slate-300">Repetir contraseña</Label>
                  <div className="relative">
                    <Input id="repeat-password" type={showRepeat ? 'text' : 'password'} required
                      value={repeatPassword} disabled={isLoading}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      onBlur={() => touch('repeatPassword')}
                      className={inputClass(!!touched.repeatPassword, fieldErrors.repeatPassword)}
                    />
                    <EyeToggle show={showRepeat} onToggle={() => setShowRepeat((v) => !v)} />
                  </div>
                  <FieldMsg show={!!touched.repeatPassword} error={fieldErrors.repeatPassword} />
                </div>
              </div>

              {/* Error global */}
              {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="h-10 w-full rounded-2xl bg-blue-600 text-sm font-bold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Creando cuenta…</>
                ) : (
                  <><span>Registrarme</span><ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
