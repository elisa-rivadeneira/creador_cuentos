import { NextRequest, NextResponse } from 'next/server'
import { FormData } from '@/types'

export async function POST(request: NextRequest) {
  try {
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
        grado: formData.grado,
        area: formData.area,
        formato_imagen: formData.formatoImagen,
        timestamp: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      throw new Error(`Error del webhook: ${response.status}`)
    }

    const result = await response.json()

    // Asumiendo que n8n devuelve las URLs de las imágenes generadas
    // Ajusta esto según la respuesta real de tu workflow
    return NextResponse.json({
      cuentoUrl: result.cuento_url || result.cuentoUrl,
      fichaUrl: result.ficha_url || result.fichaUrl,
      tema: formData.tema,
      grado: formData.grado,
      area: formData.area
    })

  } catch (error) {
    console.error('Error al procesar el cuento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}