'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Payment() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'info' | 'payment' | 'confirmation'>('info')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [yapeTxId, setYapeTxId] = useState('')

  useEffect(() => {
    // Redirigir si no hay sesión
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    // Redirigir si ya es premium
    if (session?.user?.isPaid) {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </main>
    )
  }

  // No renderizar nada si no hay sesión o ya es premium
  if (!session?.user || session.user.isPaid) {
    return null
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          yapeTxId
        }),
      })

      if (response.ok) {
        setPaymentStep('confirmation')
        // Recargar la página después de 3 segundos para actualizar la sesión
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }, 3000)
      } else {
        alert('Error al procesar el pago. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el pago. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const procesoSteps = [
    {
      emoji: '📱',
      title: 'Abre tu app Yape',
      desc: 'Ingresa a tu aplicación Yape desde tu celular'
    },
    {
      emoji: '💸',
      title: 'Yapea 20 soles',
      desc: 'Envía 20 soles al número 987-654-321'
    },
    {
      emoji: '📸',
      title: 'Toma captura',
      desc: 'Guarda el comprobante con el ID de la operación'
    },
    {
      emoji: '✅',
      title: 'Confirma aquí',
      desc: 'Ingresa el ID de la operación para activar tu cuenta Premium'
    }
  ]

  if (paymentStep === 'confirmation') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-fun text-green-600 mb-4">
              ¡Pago Confirmado!
            </h1>
            <p className="text-gray-600">
              Tu cuenta Premium ha sido activada. Ya puedes crear un cuento diario.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-green-800 mb-2">✨ Beneficios Premium:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>🎨 Un cuento personalizado cada día</li>
              <li>📚 Fichas de comprensión lectora ilimitadas</li>
              <li>🎯 Acceso prioritario a nuevas funciones</li>
              <li>💾 Historial de todos tus cuentos</li>
            </ul>
          </div>

          <Link href="/" className="btn-primary w-full">
            🏰 Ir a Crear Cuentos
          </Link>
        </div>
      </main>
    )
  }

  if (paymentStep === 'payment') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-fun text-primary-600 mb-2">
              💳 Confirmar Pago
            </h1>
            <p className="text-gray-600">
              Ingresa los datos de tu transferencia
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">📝 Datos para Yape:</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Número:</strong> 987-654-321</p>
                <p><strong>Nombre:</strong> SmartChatix</p>
                <p><strong>Monto:</strong> S/ 20.00</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  📱 Tu número de celular
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="987654321"
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  🆔 ID de operación Yape
                </label>
                <input
                  type="text"
                  value={yapeTxId}
                  onChange={(e) => setYapeTxId(e.target.value)}
                  placeholder="Ej: 12345678"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500">
                  Encontrarás este número en el comprobante de Yape
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPaymentStep('info')}
                className="btn-secondary flex-1"
              >
                ← Volver
              </button>
              <button
                onClick={handlePayment}
                disabled={loading || !phoneNumber || !yapeTxId}
                className={`btn-primary flex-1 ${
                  loading || !phoneNumber || !yapeTxId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verificando...
                  </span>
                ) : (
                  '✅ Confirmar Pago'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-fun text-primary-600 mb-2">
            ⭐ Hazte Premium
          </h1>
          <p className="text-gray-600">
            Desbloquea cuentos ilimitados por solo 20 soles
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-3 text-center">
              🆓 Plan Gratuito
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                2 cuentos gratis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">✗</span>
                Sin más cuentos después
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-gold-50 to-yellow-50 border-2 border-gold-300 rounded-lg p-4">
            <h3 className="font-bold text-gold-800 mb-3 text-center">
              ⭐ Plan Premium
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                1 cuento diario ilimitado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Historial completo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Soporte prioritario
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-yellow-800 mb-4 text-center">
            📲 ¿Cómo pagar con Yape?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {procesoSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl mb-1">{step.emoji}</div>
                <div className="text-xs font-bold text-yellow-800">{step.title}</div>
                <div className="text-xs text-yellow-600">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="btn-secondary flex-1">
            ← Volver al inicio
          </Link>
          <button
            onClick={() => setPaymentStep('payment')}
            className="btn-primary flex-1"
          >
            💳 Continuar con Yape
          </button>
        </div>
      </div>
    </main>
  )
}