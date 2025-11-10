import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const stories = await prisma.story.findMany({
      where: {
        AND: [
          { cuentoUrl: { not: null } },
          { fichaUrl: { not: null } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        ratings: {
          select: {
            rating: true,
            userId: true
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3 // Solo los 3 comentarios más recientes para la galería
        },
        _count: {
          select: {
            ratings: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Calcular promedio de ratings para cada cuento
    const storiesWithStats = stories.map(story => {
      const totalRatings = story.ratings.length
      const averageRating = totalRatings > 0
        ? story.ratings.reduce((acc, rating) => acc + rating.rating, 0) / totalRatings
        : 0

      return {
        ...story,
        averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        totalRatings,
        totalComments: story._count.comments
      }
    })

    const totalStories = await prisma.story.count({
      where: {
        AND: [
          { cuentoUrl: { not: null } },
          { fichaUrl: { not: null } }
        ]
      }
    })

    return NextResponse.json({
      stories: storiesWithStats,
      pagination: {
        page,
        limit,
        total: totalStories,
        pages: Math.ceil(totalStories / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching public stories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}