'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Payment() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [paymentStep, setPaymentStep] = useState<'info' | 'payment' | 'confirmation'>('info')

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


  const procesoSteps = [
    {
      emoji: '📱',
      title: 'Escanea el QR',
      desc: 'O yapea a 967-717-179'
    },
    {
      emoji: '💰',
      title: 'Paga 25 soles',
      desc: 'Transferencia por Yape'
    },
    {
      emoji: '📸',
      title: 'Captura pantalla',
      desc: 'Del comprobante de pago'
    },
    {
      emoji: '📱',
      title: 'Envía por WhatsApp',
      desc: 'Para confirmar tu pago'
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
    const whatsappMessage = `Hola! Acabo de hacer el pago de 25 soles para activar mi cuenta Premium de CuentaCuentos.

Mi email: ${session?.user?.email}
Mi nombre: ${session?.user?.name}

He adjuntado el comprobante de Yape. Por favor activen mi cuenta Premium.

¡Gracias!`

    const whatsappUrl = `https://wa.me/51967717179?text=${encodeURIComponent(whatsappMessage)}`

    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-lg w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-fun text-primary-600 mb-2">
              💰 Realizar Pago
            </h1>
            <p className="text-gray-600">
              Sigue estos pasos para activar tu cuenta Premium
            </p>
          </div>

          <div className="space-y-6">
            {/* Datos de Yape */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-800 mb-4 text-center">📱 Datos para Yape</h3>
              <div className="text-center space-y-2">
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <p className="text-sm text-gray-600">Número de celular:</p>
                  <p className="text-2xl font-bold text-blue-800">967-717-179</p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                  <p className="text-sm text-gray-600">Monto a transferir:</p>
                  <p className="text-3xl font-bold text-green-600">S/ 25.00</p>
                </div>
              </div>
            </div>

            {/* QR Code placeholder */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
              <h3 className="font-bold text-purple-800 mb-4 text-center">📱 Escanea el QR</h3>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm text-center">
                      QR Code<br/>967-717-179
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-purple-700 text-sm mt-2">
                O yapea directamente al número: <strong>967-717-179</strong>
              </p>
            </div>

            {/* Paso siguiente */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-yellow-800 mb-4 text-center">📸 Después del pago</h3>
              <ol className="list-decimal list-inside space-y-2 text-yellow-700">
                <li>Toma captura del comprobante de Yape</li>
                <li>Haz clic en el botón de WhatsApp abajo</li>
                <li>Adjunta la captura del comprobante</li>
                <li>Espera confirmación (máximo 24 horas)</li>
              </ol>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setPaymentStep('info')}
                className="btn-secondary flex-1"
              >
                ← Volver
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-center"
              >
                📱 Enviar a WhatsApp
              </a>
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
            3 cuentos diarios por un mes por solo 25 soles
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
                3 cuentos cada día
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