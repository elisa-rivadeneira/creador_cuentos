import { DefaultSession } from 'next-auth'

export interface FormData {
  tema: string;
  ideas: string;
  grado: string;
  formatoImagen: 'cabecera' | 'lado' | 'cuadrado';
}

export interface StoryResult {
  cuentoUrl: string;
  fichaUrl: string;
  tema: string;
  grado: string;
}

// Extender el tipo de sesión de NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      freeStoriesUsed?: number
      isPaid?: boolean
      paidAt?: Date | null
      lastStoryDate?: Date | null
    } & DefaultSession['user']
  }
}