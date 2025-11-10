'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import StoryModal from './StoryModal'

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

interface StoryGalleryProps {
  limit?: number
  showTitle?: boolean
}

export default function StoryGallery({ limit = 12, showTitle = true }: StoryGalleryProps) {
  const { data: session } = useSession()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [hoveredStory, setHoveredStory] = useState<string | null>(null)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await fetch(`/api/stories/public?limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setStories(data.stories)
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const convertToThumbnail = (url: string | null) => {
    if (!url) return ''

    if (url.includes('ninjaerp.com')) {
      return url
    }

    const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400` : url
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">☆</span>)
      } else {
        stars.push(<span key={i} className="text-gray-300">☆</span>)
      }
    }
    return stars
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando cuentos...</p>
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          ¡Sé el primero en crear un cuento!
        </h3>
        <p className="text-gray-600">
          Los cuentos aparecerán aquí una vez que se vayan creando.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-12">
          <h2 className="text-4xl font-fun text-primary-600 mb-4">
            🌟 Galería de Cuentos Mágicos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre los hermosos cuentos creados por nuestra comunidad.
            ¡Dale estrellas y comparte tus comentarios!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
              hoveredStory === story.id
                ? 'border-primary-400 shadow-xl transform scale-105'
                : 'border-gray-200 hover:border-primary-300 hover:shadow-xl'
            }`}
            onMouseEnter={() => setHoveredStory(story.id)}
            onMouseLeave={() => setHoveredStory(null)}
            onClick={() => setSelectedStory(story)}
          >
            {/* Imagen del cuento */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {story.cuentoUrl ? (
                <img
                  src={convertToThumbnail(story.cuentoUrl)}
                  alt={story.tema}
                  className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-6xl">📖</span>
                </div>
              )}

              {/* Overlay con info rápida */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👁️</div>
                    <p className="text-sm font-bold">Ver cuento completo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del cuento */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-800 line-clamp-2 flex-1 mr-2">
                  {story.tema}
                </h3>
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                  {story.grado}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {renderStars(story.averageRating)}
                </div>
                <span className="text-sm text-gray-600">
                  {story.averageRating > 0 ? story.averageRating.toFixed(1) : 'Sin calificar'}
                </span>
                <span className="text-xs text-gray-500">
                  ({story.totalRatings})
                </span>
              </div>

              {/* Autor y fecha */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span className="font-medium">
                  👨‍🏫 {story.user.name}
                </span>
                <span>{formatDate(story.createdAt)}</span>
              </div>

              {/* Comentarios */}
              {story.totalComments > 0 && (
                <div className="text-xs text-gray-500">
                  💬 {story.totalComments} comentario{story.totalComments > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para ver cuento completo */}
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          onUpdate={fetchStories}
        />
      )}
    </div>
  )
}