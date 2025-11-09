'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfileData {
  user: {
    id: string
    name: string
    email: string
    freeStoriesUsed: number
    isPaid: boolean
    paidAt: Date | null
    lastStoryDate: Date | null
    createdAt: Date
  }
  stories: Array<{
    id: string
    tema: string
    grado: string
    area: string
    cuentoUrl: string | null
    fichaUrl: string | null
    createdAt: Date
  }>
  payments: Array<{
    id: string
    amount: number
    method: string
    status: string
    yapeTxId: string | null
    createdAt: Date
  }>
  stats: {
    totalStories: number
    freeStoriesLeft: number | null
    canCreateToday: boolean
  }
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'payments'>('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      fetchProfileData()
    }
  }, [session, status, router])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const convertToThumbnail = (driveUrl: string | null) => {
    if (!driveUrl) return ''
    const fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w200` : driveUrl
  }

  const convertToDownload = (driveUrl: string | null) => {
    if (!driveUrl) return ''
    const fileId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : driveUrl
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </main>
    )
  }

  if (!session?.user || !profileData) {
    return null
  }

  const { user, stories, payments, stats } = profileData

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-fun text-white mb-2">
              👤 Mi Perfil
            </h1>
            <p className="text-white/80">
              Gestiona tu cuenta y revisa tu actividad
            </p>
          </div>
          <Link href="/" className="btn-secondary">
            ← Volver al inicio
          </Link>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Total Cuentos
              </h3>
              <p className="text-3xl font-fun text-primary-600">
                {stats.totalStories}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {user.isPaid ? '⭐' : '🎁'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Estado
              </h3>
              <p className={`text-lg font-bold ${
                user.isPaid ? 'text-gold-600' : 'text-blue-600'
              }`}>
                {user.isPaid ? 'Premium' : 'Gratuito'}
              </p>
              {!user.isPaid && stats.freeStoriesLeft !== null && (
                <p className="text-sm text-gray-600">
                  {stats.freeStoriesLeft} cuentos restantes
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {stats.canCreateToday ? '✅' : '⏰'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Crear Hoy
              </h3>
              <p className={`text-lg font-bold ${
                stats.canCreateToday ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.canCreateToday ? 'Disponible' : 'No disponible'}
              </p>
              {user.isPaid && !stats.canCreateToday && (
                <p className="text-sm text-gray-600">
                  Ya creaste tu cuento de hoy
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-bold rounded-t-lg ${
                activeTab === 'overview'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              📋 Resumen
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`px-6 py-3 font-bold rounded-t-lg ${
                activeTab === 'stories'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              📚 Mis Cuentos ({stories.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 font-bold rounded-t-lg ${
                activeTab === 'payments'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              💳 Pagos ({payments.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    👤 Información Personal
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-bold text-gray-600">Nombre:</span>
                      <span className="ml-2">{user.name}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-600">Email:</span>
                      <span className="ml-2">{user.email}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-600">Miembro desde:</span>
                      <span className="ml-2">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    💎 Estado Premium
                  </h3>
                  {user.isPaid ? (
                    <div className="bg-gold-50 border border-gold-300 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">⭐</span>
                        <span className="font-bold text-gold-800">Usuario Premium</span>
                      </div>
                      <p className="text-sm text-gold-700">
                        Activado el: {user.paidAt ? formatDate(user.paidAt) : 'N/A'}
                      </p>
                      <p className="text-sm text-gold-700 mt-2">
                        ✅ Cuentos diarios ilimitados
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎁</span>
                        <span className="font-bold text-blue-800">Usuario Gratuito</span>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        {stats.freeStoriesLeft} de 2 cuentos gratis restantes
                      </p>
                      <Link href="/payment" className="btn-primary text-sm">
                        🚀 Upgrade a Premium
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stories' && (
            <div>
              {stories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    No has creado cuentos aún
                  </h3>
                  <p className="text-gray-500 mb-4">
                    ¡Empieza creando tu primer cuento mágico!
                  </p>
                  <Link href="/" className="btn-primary">
                    ✨ Crear mi primer cuento
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => (
                    <div key={story.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">
                            {story.tema}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Grado: {story.grado}
                          </p>
                          <p className="text-sm text-gray-500">
                            Creado: {formatDate(story.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        {story.cuentoUrl && (
                          <a
                            href={convertToDownload(story.cuentoUrl)}
                            download
                            className="btn-secondary text-sm"
                          >
                            📖 Descargar Cuento
                          </a>
                        )}
                        {story.fichaUrl && (
                          <a
                            href={convertToDownload(story.fichaUrl)}
                            download
                            className="btn-primary text-sm"
                          >
                            📝 Descargar Ficha
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💳</div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    No tienes pagos registrados
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Cuando realices pagos, aparecerán aquí
                  </p>
                  {!user.isPaid && (
                    <Link href="/payment" className="btn-primary">
                      💎 Hazte Premium
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">💳</span>
                            <span className="font-bold text-lg">
                              S/ {payment.amount.toFixed(2)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              payment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'completed' ? 'Completado' :
                               payment.status === 'pending' ? 'Pendiente' : 'Fallido'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Método: {payment.method.toUpperCase()}
                          </p>
                          {payment.yapeTxId && (
                            <p className="text-sm text-gray-600">
                              ID Yape: {payment.yapeTxId}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/" className="btn-primary">
            🏰 Crear Nuevo Cuento
          </Link>
          {!user.isPaid && (
            <Link href="/payment" className="btn-secondary">
              ⭐ Hazte Premium
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}