'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userData.id}`)
        if (response.ok) {
          const freshData = await response.json()
          const fullName = `${freshData.first_name || ''} ${freshData.last_name || ''}`.trim()
          setFormData({
            name: fullName,
            email: freshData.email || userData.email || '',
            phone: freshData.phone || '',
          })
          
          // Actualizar localStorage
          const updatedUser = {
            ...userData,
            name: fullName,
            email: freshData.email || userData.email || '',
            phone: freshData.phone || '',
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        } else {
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        // Intentar usar lo que haya en local
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
           const userData = JSON.parse(storedUser)
           setFormData({
             name: userData.name || '',
             email: userData.email || '',
             phone: userData.phone || '',
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
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
        }),
      })

      if (response.ok) {
        setSuccessMessage('Perfil actualizado correctamente')
        
        // Actualizar datos locales
        const updatedUser = {
            ...user,
            name: formData.name,
            email: formData.email,
            phone: formData.phone
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

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                className="rounded-lg"
              />
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
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+57 XXX XXX XXXX"
                className="rounded-lg"
              />
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
