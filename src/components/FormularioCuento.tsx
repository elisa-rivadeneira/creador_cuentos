'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import Link from 'next/link'
import { FormData } from '@/types'

interface Props {
  onSubmit: (data: FormData) => void
  isLoading: boolean
  session: Session | null
}

export default function FormularioCuento({ onSubmit, isLoading, session }: Props) {
  const [formData, setFormData] = useState<FormData>({
    tema: '',
    ideas: '',
    grado: '',
    formatoImagen: 'cabecera'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.tema && formData.grado) {
      onSubmit(formData)
    }
  }

  // Verificar si el usuario puede crear cuentos
  const canCreateStory = () => {
    if (!session?.user) return false

    const freeStoriesUsed = session.user.freeStoriesUsed || 0
    const isPaid = session.user.isPaid || false

    if (isPaid) {
      // Usuario premium: verificar si puede crear hoy
      const lastStoryDate = session.user.lastStoryDate
      if (!lastStoryDate) return true

      const today = new Date()
      const lastStory = new Date(lastStoryDate)
      const diffTime = today.getTime() - lastStory.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays >= 1
    } else {
      // Usuario gratuito: verificar si tiene cuentos restantes
      return freeStoriesUsed < 2
    }
  }

  const getStatusMessage = () => {
    if (!session?.user) {
      return {
        type: 'warning',
        message: '⚠️ Necesitas crear una cuenta para generar cuentos'
      }
    }

    const freeStoriesUsed = session.user.freeStoriesUsed || 0
    const isPaid = session.user.isPaid || false

    if (isPaid) {
      const lastStoryDate = session.user.lastStoryDate
      if (lastStoryDate) {
        const today = new Date()
        const lastStory = new Date(lastStoryDate)
        const diffTime = today.getTime() - lastStory.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 1) {
          return {
            type: 'warning',
            message: '⏰ Ya creaste tu cuento de hoy. ¡Vuelve mañana!'
          }
        }
      }
      return {
        type: 'success',
        message: '⭐ ¡Usuario Premium! Puedes crear tu cuento diario'
      }
    } else {
      const remaining = 2 - freeStoriesUsed
      if (remaining > 0) {
        return {
          type: 'info',
          message: `🎁 Te quedan ${remaining} cuentos gratis`
        }
      } else {
        return {
          type: 'error',
          message: '💳 Cuentos gratis agotados. ¡Hazte Premium!'
        }
      }
    }
  }

  const statusMessage = getStatusMessage()
  const canCreate = canCreateStory()

  const grados = ['1°', '2°', '3°', '4°', '5°', '6°']
  const formatosImagen = [
    { value: 'cabecera', label: '🖼️ Imagen en Cabecera', desc: 'Imagen grande en la parte superior' },
    { value: 'lado', label: '📖 Imagen al Lado', desc: 'Imagen al costado del texto' },
    { value: 'cuadrado', label: '🔳 Imagen en Cuadrado', desc: 'Imagen cuadrada a un lado' }
  ]

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-fun text-primary-600 mb-2">
          ✨ Crear Cuento Mágico ✨
        </h2>
        <p className="text-gray-600 text-lg">
          ¡Vamos a crear un hermoso cuento para tus estudiantes!
        </p>
      </div>

      {/* Status Message */}
      <div className={`mb-6 p-4 rounded-lg border-2 ${
        statusMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' :
        statusMessage.type === 'info' ? 'bg-blue-50 border-blue-300 text-blue-800' :
        statusMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' :
        'bg-red-50 border-red-300 text-red-800'
      }`}>
        <p className="text-center font-bold">{statusMessage.message}</p>
        {!session?.user && (
          <div className="text-center mt-3">
            <Link href="/auth/signup" className="btn-primary mr-2">
              🎁 Crear Cuenta Gratis
            </Link>
            <Link href="/auth/signin" className="btn-secondary">
              🔑 Iniciar Sesión
            </Link>
          </div>
        )}
        {session?.user && !session.user.isPaid && (session.user.freeStoriesUsed || 0) >= 2 && (
          <div className="text-center mt-3">
            <Link href="/payment" className="btn-primary">
              💳 Hazte Premium (20 soles)
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-lg font-bold text-primary-700">
            🎯 ¿Cuál es el tema del cuento?
          </label>
          <input
            type="text"
            value={formData.tema}
            onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
            placeholder="Ej: Los animales del bosque, El ciclo del agua..."
            className="input-field"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-bold text-primary-700">
            💡 Ideas para el cuento (opcional)
          </label>
          <textarea
            value={formData.ideas}
            onChange={(e) => setFormData({ ...formData, ideas: e.target.value })}
            placeholder="Ej: Que aparezcan personajes divertidos, que tenga una moraleja sobre la amistad..."
            className="input-field min-h-[100px] resize-none"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-bold text-secondary-700">
            📚 Grado
          </label>
          <select
            value={formData.grado}
            onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
            className="select-field"
            required
          >
            <option value="">Selecciona el grado</option>
            {grados.map((grado) => (
              <option key={grado} value={grado}>
                {grado} Primaria
              </option>
            ))}
          </select>
        </div>

        {/* <div className="space-y-3">
          <label className="block text-lg font-bold text-success-700">
            🎨 ¿Cómo quieres la imagen?
          </label>
          <div className="grid gap-3">
            {formatosImagen.map((formato) => (
              <label
                key={formato.value}
                className={`flex items-center p-4 rounded-xl border-4 cursor-pointer transition-all duration-200 ${
                  formData.formatoImagen === formato.value
                    ? 'border-success-400 bg-success-50 shadow-lg'
                    : 'border-gray-200 hover:border-success-300 hover:bg-success-50/25'
                }`}
              >
                <input
                  type="radio"
                  name="formatoImagen"
                  value={formato.value}
                  checked={formData.formatoImagen === formato.value}
                  onChange={(e) => setFormData({ ...formData, formatoImagen: e.target.value as FormData['formatoImagen'] })}
                  className="sr-only"
                />
                <div>
                  <div className="text-lg font-bold text-gray-800">
                    {formato.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formato.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div> */}

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.tema || !formData.grado || !canCreate}
            className={`btn-primary text-xl font-fun min-w-[200px] ${
              isLoading || !canCreate ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Creando magia...
              </span>
            ) : (
              '🪄 ¡Crear Cuento!'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}



