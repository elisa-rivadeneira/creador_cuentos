import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isRegistering: { label: 'Is Registering', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const isRegistering = credentials.isRegistering === 'true'

        if (isRegistering) {
          // Registro
          if (!credentials.name) {
            throw new Error('El nombre es requerido')
          }

          // Verificar si el usuario ya existe
          const existingUser = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (existingUser) {
            throw new Error('El email ya está registrado')
          }

          // Crear nuevo usuario
          const hashedPassword = await bcrypt.hash(credentials.password, 12)

          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              name: credentials.name,
              freeStoriesUsed: 0,
              isPaid: false
            }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } else {
          // Login
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!

        // Obtener información actualizada del usuario
        const userInfo = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: {
            freeStoriesUsed: true,
            isPaid: true,
            paidAt: true,
            lastStoryDate: true
          }
        })

        if (userInfo) {
          session.user.freeStoriesUsed = userInfo.freeStoriesUsed
          session.user.isPaid = userInfo.isPaid
          session.user.paidAt = userInfo.paidAt
          session.user.lastStoryDate = userInfo.lastStoryDate
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}