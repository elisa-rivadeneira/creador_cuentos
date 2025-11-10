import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    const { storyId, rating } = await request.json()

    // Validar datos
    if (!storyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    // Verificar que el cuento existe
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    })

    if (!story) {
      return NextResponse.json(
        { error: 'Cuento no encontrado' },
        { status: 404 }
      )
    }

    // Crear o actualizar rating (upsert)
    const ratingRecord = await prisma.rating.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId: session.user.id
        }
      },
      update: {
        rating
      },
      create: {
        storyId,
        userId: session.user.id,
        rating
      }
    })

    return NextResponse.json({ success: true, rating: ratingRecord })
  } catch (error) {
    console.error('Error saving rating:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}