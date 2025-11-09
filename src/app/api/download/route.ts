import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('url')

    if (!fileUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Verificar que la URL sea de ninjaerp.com para seguridad
    if (!fileUrl.includes('ninjaerp.com')) {
      return NextResponse.json({ error: 'Invalid URL domain' }, { status: 403 })
    }

    // Descargar el archivo desde ninjaerp.com
    const response = await fetch(fileUrl)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 404 })
    }

    // Extraer el nombre del archivo de la URL
    const urlParts = fileUrl.split('/')
    const fileName = urlParts[urlParts.length - 1] || 'download.png'

    // Obtener el buffer del archivo
    const fileBuffer = await response.arrayBuffer()

    // Crear la respuesta con headers para forzar descarga
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${decodeURIComponent(fileName)}"`,
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Content-Length': fileBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}