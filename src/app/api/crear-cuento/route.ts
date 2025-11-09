import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FormData } from '@/types'

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

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar límites
    const today = new Date()
    const freeStoriesUsed = user.freeStoriesUsed
    const isPaid = user.isPaid

    if (isPaid) {
      // Usuario premium: verificar si puede crear hoy
      if (user.lastStoryDate) {
        const lastStory = new Date(user.lastStoryDate)
        const diffTime = today.getTime() - lastStory.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 1) {
          return NextResponse.json(
            { error: 'Ya has creado tu cuento diario. Vuelve mañana.' },
            { status: 403 }
          )
        }
      }
    } else {
      // Usuario gratuito: verificar límite
      if (freeStoriesUsed >= 2) {
        return NextResponse.json(
          { error: 'Has agotado tus cuentos gratuitos. Hazte Premium para continuar.' },
          { status: 403 }
        )
      }
    }

    const formData: FormData = await request.json()

    // URL del webhook de n8n (deberás configurar esta variable de entorno)
    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      throw new Error('N8N_WEBHOOK_URL no está configurada')
    }

    // Enviar datos al webhook de n8n
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tema: formData.tema,
        ideas: formData.ideas,
        grado: formData.grado,
        formato_imagen: formData.formatoImagen,
        timestamp: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Error response from n8n:', response.status, errorText)
      throw new Error(`Error del webhook: ${response.status} - ${errorText}`)
    }

    // Log raw response before parsing
    const responseText = await response.text()
    console.log('Raw response text from n8n:', responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.log('Response text that failed to parse:', responseText)
      throw new Error('Invalid JSON response from n8n webhook')
    }

    // Debug: Log de la respuesta de n8n
    console.log('Respuesta de n8n RAW:', JSON.stringify(result, null, 2))
    console.log('Es array?', Array.isArray(result))
    console.log('Longitud si es array:', Array.isArray(result) ? result.length : 'N/A')

    // n8n devuelve un array con un objeto, extraer el primer elemento
    const data = Array.isArray(result) ? result[0] : result
    console.log('Data después de procesar:', JSON.stringify(data, null, 2))

    // Extraer las URLs correctamente
    const cuentoUrl = data?.cuento_url || data?.cuentoUrl || ''
    const fichaUrl = data?.ficha_url || data?.fichaUrl || ''

    console.log('URLs extraídas - cuento:', cuentoUrl, 'ficha:', fichaUrl)

    const finalResponse = {
      cuentoUrl: cuentoUrl,
      fichaUrl: fichaUrl,
      tema: formData.tema,
      grado: formData.grado
    }

    console.log('Respuesta final enviada:', JSON.stringify(finalResponse, null, 2))

    // Actualizar contador de usuario y fecha
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        freeStoriesUsed: isPaid ? user.freeStoriesUsed : user.freeStoriesUsed + 1,
        lastStoryDate: today
      }
    })

    // Guardar el cuento en la base de datos
    await prisma.story.create({
      data: {
        userId: session.user.id,
        tema: formData.tema,
        ideas: formData.ideas || '',
        grado: formData.grado,
        area: '', // Área vacía por defecto
        formatoImagen: formData.formatoImagen,
        cuentoUrl: cuentoUrl,
        fichaUrl: fichaUrl
      }
    })

    return NextResponse.json(finalResponse)

  } catch (error) {
    console.error('Error al procesar el cuento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}