export interface DailyLimitResult {
  canCreate: boolean
  storiesLeft: number
  resetTime: Date
  isNewDay: boolean
}

/**
 * Verifica si es un nuevo día (desde medianoche)
 */
export function isNewDay(lastResetDate: Date | string | null): boolean {
  if (!lastResetDate) return true

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Asegurar que lastResetDate sea un objeto Date
    const resetDate = new Date(lastResetDate)

    // Verificar que sea una fecha válida
    if (isNaN(resetDate.getTime())) {
      console.error('Invalid date provided to isNewDay:', lastResetDate)
      return true // Si la fecha es inválida, considerar como nuevo día
    }

    const lastReset = new Date(resetDate.getFullYear(), resetDate.getMonth(), resetDate.getDate())

    return today.getTime() > lastReset.getTime()
  } catch (error) {
    console.error('Error in isNewDay function:', error)
    return true // En caso de error, considerar como nuevo día
  }
}

/**
 * Obtiene la próxima medianoche
 */
export function getNextMidnight(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

/**
 * Verifica los límites diarios para un usuario premium
 */
export function checkDailyLimits(
  isPaid: boolean,
  dailyStoriesCount: number,
  lastResetDate: Date | string | null,
  freeStoriesUsed: number
): DailyLimitResult {
  const newDay = isNewDay(lastResetDate)
  const resetTime = getNextMidnight()

  if (!isPaid) {
    // Usuario gratuito: máximo 2 cuentos totales
    const storiesLeft = Math.max(0, 2 - freeStoriesUsed)
    return {
      canCreate: storiesLeft > 0,
      storiesLeft,
      resetTime,
      isNewDay: newDay
    }
  }

  // Usuario premium: 3 cuentos por día
  const currentCount = newDay ? 0 : dailyStoriesCount
  const storiesLeft = Math.max(0, 3 - currentCount)

  return {
    canCreate: storiesLeft > 0,
    storiesLeft,
    resetTime,
    isNewDay: newDay
  }
}

/**
 * Formatea el tiempo restante hasta la medianoche
 */
export function formatTimeUntilReset(resetTime: Date): string {
  const now = new Date()
  const diff = resetTime.getTime() - now.getTime()

  if (diff <= 0) return "Disponible ahora"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}