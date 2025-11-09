import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        freeStoriesUsed: true,
        isPaid: true,
        paidAt: true,
        lastStoryDate: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener historial de cuentos
    const stories = await prisma.story.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        tema: true,
        grado: true,
        area: true,
        cuentoUrl: true,
        fichaUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Últimos 10 cuentos
    })

    // Obtener historial de pagos
    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        yapeTxId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calcular estadísticas
    const totalStories = await prisma.story.count({
      where: { userId: session.user.id }
    })

    const freeStoriesLeft = user.isPaid ? null : 2 - user.freeStoriesUsed

    let canCreateToday = false
    if (user.isPaid) {
      if (!user.lastStoryDate) {
        canCreateToday = true
      } else {
        const today = new Date()
        const lastStory = new Date(user.lastStoryDate)
        const diffTime = today.getTime() - lastStory.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        canCreateToday = diffDays >= 1
      }
    } else {
      canCreateToday = user.freeStoriesUsed < 2
    }

    return NextResponse.json({
      user,
      stories,
      payments,
      stats: {
        totalStories,
        freeStoriesLeft,
        canCreateToday
      }
    })

  } catch (error) {
    console.error('Error al obtener el perfil:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}