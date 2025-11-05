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

    // Debug: Log de la respuesta de n8n
    console.log('Respuesta de n8n RAW:', JSON.stringify(result, null, 2))
    console.log('Es array?', Array.isArray(result))
    console.log('Longitud si es array:', Array.isArray(result) ? result.length : 'N/A')

    // n8n devuelve un array, tomar el primer elemento
    const data = Array.isArray(result) ? result[0] : result
    console.log('Data después de procesar:', JSON.stringify(data, null, 2))

    // Asumiendo que n8n devuelve las URLs de las imágenes generadas
    // Ajusta esto según la respuesta real de tu workflow
    const finalResponse = {
      cuentoUrl: data.cuento_url || data.cuentoUrl,
      fichaUrl: data.ficha_url || data.fichaUrl,
      tema: formData.tema,
      grado: formData.grado,
      area: formData.area
    }

    console.log('Respuesta final enviada:', JSON.stringify(finalResponse, null, 2))

    return NextResponse.json(finalResponse)

  } catch (error) {
    console.error('Error al procesar el cuento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}