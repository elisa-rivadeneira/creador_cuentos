'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string | null
}

interface Rating {
  rating: number
  userId: string
}

interface Comment {
  id: string
  content: string
  createdAt: Date | string
  user: {
    name: string | null
  }
}

interface Story {
  id: string
  tema: string
  grado: string
  cuentoUrl: string | null
  fichaUrl: string | null
  createdAt: Date | string
  user: User
  ratings: Rating[]
  comments: Comment[]
  averageRating: number
  totalRatings: number
  totalComments: number
}

interface StoryModalProps {
  story: Story
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function StoryModal({ story, isOpen, onClose, onUpdate }: StoryModalProps) {
  const { data: session } = useSession()
  const [currentView, setCurrentView] = useState<'cuento' | 'ficha'>('cuento')
  const [userRating, setUserRating] = useState<number>(0)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [expandedImage, setExpandedImage] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      const existingRating = story.ratings.find(r => r.userId === session.user.id)
      if (existingRating) {
        setUserRating(existingRating.rating)
      }
    }
  }, [story.ratings, session?.user?.id])

  const convertToThumbnail = (url: string | null) => {
    if (!url) return ''

    if (url.includes('ninjaerp.com')) {
      return url
    }

    const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w800` : url
  }

  const convertToDownload = (url: string | null) => {
    if (!url) return ''

    if (url.includes('ninjaerp.com')) {
      return `/api/download?url=${encodeURIComponent(url)}`
    }

    const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url
  }

  const submitRating = async (rating: number) => {
    if (!session?.user?.id || isSubmittingRating) return

    setIsSubmittingRating(true)
    try {
      const response = await fetch('/api/stories/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId: story.id,
          rating
        }),
      })

      if (response.ok) {
        setUserRating(rating)
        onUpdate()
      } else {
        alert('Error al calificar el cuento')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al calificar el cuento')
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !newComment.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch('/api/stories/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId: story.id,
          content: newComment.trim()
        }),
      })

      if (response.ok) {
        setNewComment('')
        onUpdate()
      } else {
        alert('Error al agregar comentario')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al agregar comentario')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const renderStars = (rating: number, interactive = false) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-2xl transition-colors ${
            interactive ? 'hover:text-yellow-400 cursor-pointer' : ''
          } ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={interactive ? () => submitRating(i) : undefined}
          disabled={interactive && (!session?.user?.id || isSubmittingRating)}
        >
          ★
        </button>
      )
    }
    return stars
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  const currentImageUrl = currentView === 'cuento' ? story.cuentoUrl : story.fichaUrl

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{story.tema}</h2>
            <p className="text-gray-600">
              {story.grado} • Por {story.user.name} • {formatDate(story.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Imagen principal */}
          <div className="flex-1 flex flex-col">
            {/* Controles de vista */}
            <div className="flex border-b">
              <button
                onClick={() => setCurrentView('cuento')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  currentView === 'cuento'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                📖 Cuento
              </button>
              <button
                onClick={() => setCurrentView('ficha')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  currentView === 'ficha'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                📝 Comprensión Lectora
              </button>
            </div>

            {/* Imagen */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
              {currentImageUrl ? (
                <div className="relative max-w-full max-h-full">
                  <img
                    src={convertToThumbnail(currentImageUrl)}
                    alt={currentView === 'cuento' ? story.tema : 'Ficha de comprensión'}
                    className={`max-w-full max-h-full object-contain cursor-pointer transition-transform duration-300 ${
                      expandedImage ? 'scale-150' : 'hover:scale-105'
                    }`}
                    onClick={() => setExpandedImage(!expandedImage)}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => setExpandedImage(!expandedImage)}
                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      {expandedImage ? '🔍-' : '🔍+'}
                    </button>
                    <a
                      href={convertToDownload(currentImageUrl)}
                      download
                      className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      📥
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📖</div>
                  <p>Imagen no disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="w-80 border-l bg-gray-50 flex flex-col">
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">⭐ Calificación</h3>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {renderStars(story.averageRating)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {story.averageRating > 0 ? story.averageRating.toFixed(1) : 'Sin calificar'}
                    ({story.totalRatings} {story.totalRatings === 1 ? 'voto' : 'votos'})
                  </p>

                  {session?.user && (
                    <div>
                      <p className="text-sm text-gray-700 mb-2">Tu calificación:</p>
                      <div className="flex justify-center">
                        {renderStars(userRating, true)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comentarios */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">
                  💬 Comentarios ({story.totalComments})
                </h3>

                {/* Agregar comentario */}
                {session?.user && (
                  <form onSubmit={submitComment} className="mb-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe tu comentario..."
                      className="w-full p-3 border rounded-lg resize-none text-sm"
                      rows={3}
                      disabled={isSubmittingComment}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      {isSubmittingComment ? 'Enviando...' : 'Comentar'}
                    </button>
                  </form>
                )}

                {!session?.user && (
                  <p className="text-sm text-gray-500 text-center mb-4 p-3 bg-gray-100 rounded-lg">
                    Inicia sesión para comentar y calificar
                  </p>
                )}

                {/* Lista de comentarios */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {story.comments.map((comment) => (
                    <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800 text-sm">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}

                  {story.comments.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">
                      No hay comentarios aún
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}