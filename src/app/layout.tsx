import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'Creador de Cuentos Mágicos ✨',
  description: 'Crea hermosos cuentos e ilustraciones para niños de primaria con inteligencia artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-comic">
        <SessionProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-400 to-green-400">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}