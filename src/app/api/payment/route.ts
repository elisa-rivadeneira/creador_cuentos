import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      )
    }

    const { phoneNumber, yapeTxId } = await request.json()

    if (!phoneNumber || !yapeTxId) {
      return NextResponse.json(
        { error: 'Número de teléfono e ID de transacción son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya es premium
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.isPaid) {
      return NextResponse.json(
        { error: 'El usuario ya tiene acceso premium' },
        { status: 400 }
      )
    }

    // Verificar si la transacción ya existe
    const existingPayment = await prisma.payment.findFirst({
      where: { yapeTxId: yapeTxId }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Esta transacción ya ha sido procesada' },
        { status: 400 }
      )
    }

    // En un entorno real, aquí verificarías la transacción con la API de Yape
    // Por ahora, simularemos que la transacción es válida

    // Crear registro de pago
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: 20.00,
        method: 'yape',
        status: 'completed', // En producción, sería 'pending' hasta verificar
        yapeTxId: yapeTxId
      }
    })

    // Activar usuario premium
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isPaid: true,
        paidAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Pago procesado correctamente. Cuenta Premium activada.',
      paymentId: payment.id
    })

  } catch (error) {
    console.error('Error al procesar el pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}