import NextAuth from 'next-auth'

// Models: User
import '@/models/UserModel'
import authOptions from './authOptions'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
