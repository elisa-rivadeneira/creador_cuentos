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