'use client'

import { useState } from 'react'
import { Session } from 'next-auth'
import Link from 'next/link'
import { FormData } from '@/types'
import { checkDailyLimits, formatTimeUntilReset } from '@/lib/dailyLimits'

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
  const [incluirComprension, setIncluirComprension] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.tema && (!incluirComprension || formData.grado)) {
      onSubmit(formData)
    }
  }

  // Verificar límites usando la nueva lógica
  const getDailyLimits = () => {
    if (!session?.user) {
      return {
        canCreate: false,
        storiesLeft: 0,
        resetTime: new Date(),
        isNewDay: false
      }
    }

    return checkDailyLimits(
      session.user.isPaid || false,
      session.user.dailyStoriesCount || 0,
      session.user.lastResetDate || null,
      session.user.freeStoriesUsed || 0
    )
  }

  const getStatusMessage = () => {
    if (!session?.user) {
      return {
        type: 'warning',
        message: '⚠️ Necesitas crear una cuenta para generar cuentos'
      }
    }

    const limits = getDailyLimits()
    const isPaid = session.user.isPaid || false

    if (isPaid) {
      if (limits.canCreate) {
        return {
          type: 'success',
          message: `⭐ Usuario Premium! Te quedan ${limits.storiesLeft} de 3 cuentos hoy`
        }
      } else {
        const timeLeft = formatTimeUntilReset(limits.resetTime)
        return {
          type: 'warning',
          message: `⏰ Has creado tus 3 cuentos diarios. Renueva en ${timeLeft}`
        }
      }
    } else {
      if (limits.canCreate) {
        return {
          type: 'info',
          message: `🎁 Te quedan ${limits.storiesLeft} de 2 cuentos gratis`
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
  const dailyLimits = getDailyLimits()
  const canCreate = dailyLimits.canCreate

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
              💳 Hazte Premium (25 soles)
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

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-primary-700">📖 Comprensión Lectora</h3>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={incluirComprension}
                onChange={(e) => setIncluirComprension(e.target.checked)}
                className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <span className="text-lg font-medium text-gray-700">
                Incluir ficha de comprensión lectora
              </span>
            </label>
          </div>

          {incluirComprension && (
            <div className="space-y-2 pl-4 border-l-4 border-primary-200 bg-primary-50/30 p-4 rounded-r-lg">
              <label className="block text-lg font-bold text-secondary-700">
                📚 Grado
              </label>
              <select
                value={formData.grado}
                onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                className="select-field"
                required={incluirComprension}
              >
                <option value="">Selecciona el grado</option>
                {grados.map((grado) => (
                  <option key={grado} value={grado}>
                    {grado} Primaria
                  </option>
                ))}
              </select>
            </div>
          )}
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
            disabled={isLoading || !formData.tema || (incluirComprension && !formData.grado) || !canCreate}
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



