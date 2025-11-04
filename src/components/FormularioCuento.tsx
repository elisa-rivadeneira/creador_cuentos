'use client'

import { useState } from 'react'
import { FormData } from '@/types'

interface Props {
  onSubmit: (data: FormData) => void
  isLoading: boolean
}

export default function FormularioCuento({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<FormData>({
    tema: '',
    grado: '',
    area: '',
    formatoImagen: 'cabecera'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.tema && formData.grado && formData.area) {
      onSubmit(formData)
    }
  }

  const grados = ['1°', '2°', '3°', '4°', '5°', '6°']
  const areas = ['Ciencias Naturales', 'Ciencias Sociales', 'Matemáticas', 'Lenguaje', 'Inglés', 'Educación Física', 'Artes']
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

        <div className="grid md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <label className="block text-lg font-bold text-accent-600">
              📖 Área de Estudio
            </label>
            <select
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="select-field"
              required
            >
              <option value="">Selecciona el área</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
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
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.tema || !formData.grado || !formData.area}
            className={`btn-primary text-xl font-fun min-w-[200px] ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
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