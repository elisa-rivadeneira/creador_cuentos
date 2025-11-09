'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FormularioCuento from '@/components/FormularioCuento'
import AuthButton from '@/components/AuthButton'
import { FormData, StoryResult } from '@/types'

export default function Home() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<StoryResult | null>(null)

  const convertToThumbnail = (url: string | undefined) => {
    console.log('convertToThumbnail called with:', url, typeof url)
    if (!url) {
      console.log('URL is falsy, returning empty string')
      return ''
    }

    // Si es una URL de ninjaerp.com, devolverla tal como está
    try {
      if (url.includes('ninjaerp.com')) {
        console.log('ninjaerp.com URL detected, returning as-is:', url)
        return url
      }
    } catch (error) {
      console.error('Error checking ninjaerp.com URL:', error)
      return url // Devolver la URL original en caso de error
    }

    // Para URLs de Google Drive (backward compatibility)
    const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    const result = fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w800` : url
    console.log('convertToThumbnail result:', result)
    return result
  }

  const convertToDownload = (url: string | undefined) => {
    if (!url) return ''

    // Si es una URL de ninjaerp.com, usar el proxy de descarga
    try {
      if (url.includes('ninjaerp.com')) {
        return `/api/download?url=${encodeURIComponent(url)}`
      }
    } catch (error) {
      console.error('Error checking ninjaerp.com URL in convertToDownload:', error)
      return url
    }

    // Para URLs de Google Drive (backward compatibility)
    const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url
  }

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/crear-cuento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setResult(result)
      } else {
        alert('Error al crear el cuento. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el cuento. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNuevoCuento = () => {
    setResult(null)
  }

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto py-8">
        <div className="flex justify-end mb-4">
          <AuthButton />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-fun text-white mb-4 drop-shadow-lg animate-float">
            🏰 Creador de Cuentos Mágicos 🏰
          </h1>
          <p className="text-xl text-white/90 font-bold drop-shadow">
            ¡Crea historias increíbles para tus estudiantes de primaria!
          </p>
        </div>

        {!result ? (
          <FormularioCuento onSubmit={handleFormSubmit} isLoading={isLoading} session={session} />
        ) : (
          <div className="card max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-fun text-success-600 mb-4">
                🎉 ¡Tu cuento está listo! 🎉
              </h2>
              <p className="text-lg text-gray-600">
                Tema: <span className="font-bold text-primary-600">{result.tema}</span> |
                Grado: <span className="font-bold text-secondary-600">{result.grado}</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-4 border-blue-200">
                <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">
                  📖 Ficha de Lectura
                </h3>
                <div className="bg-white rounded-xl p-4 shadow-inner">
                  {result.cuentoUrl ? (
                    <img
                      src={convertToThumbnail(result.cuentoUrl)}
                      alt="Ficha de cuento"
                      className="w-full rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                      Cargando imagen...
                    </div>
                  )}
                </div>
                <a
                  href={convertToDownload(result.cuentoUrl)}
                  download
                  className="btn-secondary w-full mt-4 inline-block text-center"
                >
                  📥 Descargar Cuento
                </a>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-4 border-green-200">
                <h3 className="text-xl font-bold text-green-700 mb-4 text-center">
                  ❓ Comprensión Lectora
                </h3>
                <div className="bg-white rounded-xl p-4 shadow-inner">
                  {result.fichaUrl ? (
                    <img
                      src={convertToThumbnail(result.fichaUrl)}
                      alt="Ficha de comprensión"
                      className="w-full rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                      Cargando imagen...
                    </div>
                  )}
                </div>
                <a
                  href={convertToDownload(result.fichaUrl)}
                  download
                  className="btn-primary w-full mt-4 inline-block text-center"
                >
                  📥 Descargar Preguntas
                </a>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleNuevoCuento}
                className="btn-primary text-xl font-fun"
              >
                ✨ Crear Otro Cuento
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-white font-bold">Hecho con</span>
            <span className="text-red-400 text-xl animate-pulse">❤️</span>
            <span className="text-white font-bold">para la educación por SmartChatix</span>
          </div>
        </div>
      </div>
    </main>
  )
}