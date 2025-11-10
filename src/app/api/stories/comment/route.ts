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

    const { storyId, content } = await request.json()

    // Validar datos
    if (!storyId || !content || content.trim().length === 0) {
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

    // Crear comentario
    const comment = await prisma.comment.create({
      data: {
        storyId,
        userId: session.user.id,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('Error saving comment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}