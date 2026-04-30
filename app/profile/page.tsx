'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { fetchWithAuth } from "@/lib/api"

const COUNTRY_PREFIXES = [
  { code: '+1', flag: '🇺🇸' },
  { code: '+52', flag: '🇲🇽' },
  { code: '+54', flag: '🇦🇷' },
  { code: '+55', flag: '🇧🇷' },
  { code: '+56', flag: '🇨🇱' },
  { code: '+57', flag: '🇨🇴' },
  { code: '+51', flag: '🇵🇪' },
  { code: '+58', flag: '🇻🇪' },
  { code: '+593', flag: '🇪🇨' },
  { code: '+591', flag: '🇧🇴' },
  { code: '+595', flag: '🇵🇾' },
  { code: '+598', flag: '🇺🇾' },
  { code: '+34', flag: '🇪🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+33', flag: '🇫🇷' },
  { code: '+49', flag: '🇩🇪' },
  { code: '+39', flag: '🇮🇹' },
  { code: '+351', flag: '🇵🇹' },
  { code: '+7', flag: '🇷🇺' },
  { code: '+86', flag: '🇨🇳' },
  { code: '+91', flag: '🇮🇳' },
  { code: '+81', flag: '🇯🇵' },
  { code: '+82', flag: '🇰🇷' },
  { code: '+61', flag: '🇦🇺' },
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

        // Obtener datos frescos desde el servidor
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

          // Actualizar localStorage
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
        // Intentar usar lo que haya en local
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: fullPhone,
        }),
      })

      if (response.ok) {
        setSuccessMessage('Perfil actualizado correctamente')

        // Actualizar datos locales
        const updatedUser = {
          ...user,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: fullPhone
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        setTimeout(() => {
          router.push('/protected')
        }, 1500)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <Link href="/protected" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Editar perfil</CardTitle>
            <CardDescription>Actualiza tus datos personales</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {successMessage && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  className="rounded-lg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Tu apellido"
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                className="rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="flex gap-2">
                <select
                  name="phonePrefix"
                  value={formData.phonePrefix}
                  onChange={(e) => setFormData(prev => ({ ...prev, phonePrefix: e.target.value }))}
                  className="flex h-10 w-[100px] shrink-0 items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {COUNTRY_PREFIXES.map((country) => (
                    <option
                      key={`${country.flag}-${country.code}`}
                      value={country.code}
                    >
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <Input
                  id="phone"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/[^0-9\s]/g, '') }))}
                  placeholder="300 123 4567"
                  className="rounded-lg flex-1"
                />
              </div>
            </div>



            <div className="flex gap-3 pt-4">
              <Link href="/protected" className="flex-1">
                <Button variant="outline" className="w-full rounded-lg">
                  Cancelar
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
