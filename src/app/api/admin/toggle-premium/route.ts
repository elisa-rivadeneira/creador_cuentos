import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar que sea admin
    if (!session?.user?.email || session.user.email !== 'admin@smartchatix.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, isPaid } = await request.json()

    if (!userId || typeof isPaid !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const updateData: any = {
      isPaid,
      paidAt: isPaid ? new Date() : null
    }

    // Si se está haciendo premium, resetear contadores
    if (isPaid) {
      updateData.dailyStoriesCount = 0
      updateData.lastResetDate = new Date()
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    // Si se está activando premium, crear un registro de pago manual
    if (isPaid) {
      await prisma.payment.create({
        data: {
          userId,
          amount: 25,
          method: 'admin',
          status: 'completed',
          yapeTxId: 'ADMIN_ACTIVATION'
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling premium:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}