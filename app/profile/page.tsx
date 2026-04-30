'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle2, Loader2, Mail, Phone, User } from 'lucide-react'
import { fetchWithAuth } from "@/lib/api"

const COUNTRY_PREFIXES = [
  { code: '+1', flag: 'US' },
  { code: '+52', flag: 'MX' },
  { code: '+54', flag: 'AR' },
  { code: '+55', flag: 'BR' },
  { code: '+56', flag: 'CL' },
  { code: '+57', flag: 'CO' },
  { code: '+51', flag: 'PE' },
  { code: '+58', flag: 'VE' },
  { code: '+593', flag: 'EC' },
  { code: '+591', flag: 'BO' },
  { code: '+595', flag: 'PY' },
  { code: '+598', flag: 'UY' },
  { code: '+34', flag: 'ES' },
  { code: '+44', flag: 'GB' },
  { code: '+33', flag: 'FR' },
  { code: '+49', flag: 'DE' },
  { code: '+39', flag: 'IT' },
  { code: '+351', flag: 'PT' },
  { code: '+7', flag: 'RU' },
  { code: '+86', flag: 'CN' },
  { code: '+91', flag: 'IN' },
  { code: '+81', flag: 'JP' },
  { code: '+82', flag: 'KR' },
  { code: '+61', flag: 'AU' },
]

const parsePhone = (phoneString: string) => {
  if (!phoneString) return { prefix: '+57', number: '' }
  for (const country of COUNTRY_PREFIXES) {
    if (phoneString.startsWith(country.code)) {
      return { prefix: country.code, number: phoneString.substring(country.code.length).trim() }
    }
  }
  return { prefix: '+57', number: phoneString }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phonePrefix: '+57',
    phoneNumber: '',
    rol: '',
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          router.push('/auth/login')
          return
        }

        const userData = JSON.parse(storedUser)
        setUser(userData)

        const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/${userData.id}`)
        if (response.ok) {
          const freshData = await response.json()
          const phoneData = parsePhone(freshData.phone || '')
          const firstName = freshData.first_name || userData.first_name || userData.name?.split(' ')[0] || ''
          const lastName = freshData.last_name || userData.last_name || userData.name?.split(' ').slice(1).join(' ') || ''
          setFormData({
            firstName,
            lastName,
            email: freshData.email || userData.email || '',
            phonePrefix: phoneData.prefix,
            phoneNumber: phoneData.number,
            rol: freshData.rol || userData.rol || '',
          })

          const updatedUser = {
            ...userData,
            name: `${firstName} ${lastName}`.trim(),
            email: freshData.email || userData.email || '',
            phone: freshData.phone || '',
            rol: freshData.rol || userData.rol || '',
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        } else {
          const phoneData = parsePhone(userData.phone || '')
          setFormData({
            firstName: userData.first_name || userData.name?.split(' ')[0] || '',
            lastName: userData.last_name || userData.name?.split(' ').slice(1).join(' ') || '',
            email: userData.email || '',
            phonePrefix: phoneData.prefix,
            phoneNumber: phoneData.number,
            rol: userData.rol || '',
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          const phoneData = parsePhone(userData.phone || '')
          setFormData({
            firstName: userData.first_name || userData.name?.split(' ')[0] || '',
            lastName: userData.last_name || userData.name?.split(' ').slice(1).join(' ') || '',
            email: userData.email || '',
            phonePrefix: phoneData.prefix,
            phoneNumber: phoneData.number,
            rol: userData.rol || '',
          })
        } else {
          router.push('/auth/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const fullPhone = `${formData.phonePrefix}${formData.phoneNumber}`
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: fullPhone,
        }),
      })

      if (response.ok) {
        setSuccessMessage('Perfil actualizado correctamente')
        const updatedUser = {
          ...user,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: fullPhone,
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setTimeout(() => router.push('/protected'), 1500)
      } else {
        const contentType = response.headers.get("content-type")
        let errorMsg = 'Error al actualizar el perfil'
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const error = await response.json()
          errorMsg = error.message || errorMsg
        } else {
          errorMsg = await response.text()
        }
        setErrorMessage(errorMsg)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrorMessage('Error al actualizar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  const displayName = `${formData.firstName} ${formData.lastName}`.trim() || formData.email || "Usuario"

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] px-4 py-8 dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_48%,#0f172a_100%)]">
      <div className="mx-auto max-w-5xl">
        <Button asChild variant="ghost" className="mb-6 rounded-xl text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
          <Link href="/protected">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
          <aside className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/60 dark:bg-slate-900 dark:shadow-slate-950/20">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <User className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-blue-200">Mi perfil</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{displayName}</h1>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-300" />
                <span className="truncate">{formData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-300" />
                <span>{formData.phonePrefix}{formData.phoneNumber || " Sin telefono"}</span>
              </div>
            </div>
          </aside>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Editar datos personales</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Mantén tu informacion actualizada para que los vendedores y compradores puedan contactarte.</p>
              </div>

              {successMessage && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  {successMessage}
                </div>
              )}
              {errorMessage && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{errorMessage}</div>}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="firstName" name="firstName" label="Nombre" value={formData.firstName} onChange={handleInputChange} placeholder="Tu nombre" />
                <Field id="lastName" name="lastName" label="Apellido" value={formData.lastName} onChange={handleInputChange} placeholder="Tu apellido" />
              </div>

              <Field id="email" name="email" label="Correo electronico" value={formData.email} onChange={handleInputChange} placeholder="tu@email.com" disabled />

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">Telefono</Label>
                <div className="flex gap-2">
                  <select
                    name="phonePrefix"
                    value={formData.phonePrefix}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phonePrefix: event.target.value }))}
                    className="h-12 w-[108px] shrink-0 rounded-2xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  >
                    {COUNTRY_PREFIXES.map((country, index) => (
                      <option key={`${country.flag}-${country.code}-${index}`} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phone"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phoneNumber: event.target.value.replace(/[^0-9\s]/g, '') }))}
                    placeholder="300 123 4567"
                    className="h-12 flex-1 rounded-2xl bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <Button asChild variant="outline" className="h-12 flex-1 rounded-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <Link href="/protected">Cancelar</Link>
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="h-12 flex-1 rounded-2xl bg-blue-600 font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700">
                  {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props
  return (
    <div className="space-y-2">
      <Label htmlFor={inputProps.id} className="text-slate-700 dark:text-slate-300">{label}</Label>
      <Input
        {...inputProps}
        className="h-12 rounded-2xl bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-800"
      />
    </div>
  )
}
