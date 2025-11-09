'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { checkDailyLimits } from '@/lib/dailyLimits'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="animate-pulse bg-white/20 rounded-full px-4 py-2 w-24 h-10"></div>
    )
  }

  if (session?.user) {
    const limits = checkDailyLimits(
      session.user.isPaid || false,
      session.user.dailyStoriesCount || 0,
      session.user.lastResetDate || null,
      session.user.freeStoriesUsed || 0
    )

    return (
      <div className="flex items-center gap-4">
        {!session.user.isPaid && (
          <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-bold">
            {limits.storiesLeft > 0
              ? `🎁 ${limits.storiesLeft} cuentos gratis restantes`
              : '💳 Cuentos gratis agotados'
            }
          </div>
        )}

        {session.user.isPaid && (
          <div className="bg-gold-500/90 text-white px-3 py-1 rounded-full text-sm font-bold">
            ⭐ Premium: {limits.storiesLeft}/3 hoy
          </div>
        )}

        <div className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2">
          <span className="text-gray-800 font-bold">
            👋 {session.user.name}
          </span>
          <Link
            href="/profile"
            className="text-blue-600 hover:text-blue-700 font-bold text-sm mx-2"
          >
            👤 Perfil
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-red-600 hover:text-red-700 font-bold text-sm"
          >
            Salir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/signin"
        className="bg-white/90 hover:bg-white text-gray-800 font-bold py-2 px-4 rounded-full transition-all duration-200"
      >
        🔑 Iniciar Sesión
      </Link>
      <Link
        href="/auth/signup"
        className="bg-green-500/90 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200"
      >
        🎁 Crear Cuenta
      </Link>
    </div>
  )
}