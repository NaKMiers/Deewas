import { connectDatabase } from '@/config/database'
import CategoryModel from '@/models/CategoryModel'
import SettingsModel from '@/models/SettingsModel'
import UserModel from '@/models/UserModel'
import WalletModel from '@/models/WalletModel'
import bcrypt from 'bcrypt'
import { SessionStrategy } from 'next-auth'

// Models: Wallet, Category, Settings, User
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/UserModel'
import '@/models/WalletModel'

// Providers
import { initCategories } from '@/constants/categories'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // debug: process.env.NODE_ENV === 'development',
  providers: [
    // GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // CREDENTIALS
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        usernameOrEmail: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        console.log('- Credentials -')

        // check if credentials is empty
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          return null
        }

        // get data from credentials
        const { usernameOrEmail, password } = credentials

        // find user from database
        const user: any = await UserModel.findOne({
          $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
        }).lean()

        // check user exists or not in database
        if (!user) {
          throw new Error('Incorrect username or email')
        }

        // check if user is not local
        if (user.authType !== 'local') {
          throw new Error('This account is authenticated by ' + user.authType)
        }

        // check password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
          // push error to call back
          throw new Error('Incorrect username or email')
        }

        // // exclude password from user who have just logged in
        const { password: _, avatar: image, ...otherDetails } = user

        // return to session callback
        return { ...otherDetails, image, name: user.firstName + ' ' + user.lastName }
      },
    }),

    // ...add providers here
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      console.log('- JWT -')

      if (trigger === 'update' && token.email) {
        console.log('- Update Token -')
        const userDB: any = await UserModel.findOne({ email: token.email }).lean()
        if (userDB) {
          const { password: _, ...otherDetails } = userDB

          return { ...token, ...otherDetails }
        }
      }

      if (user) {
        console.log('- User -')
        const userDB: any = await UserModel.findOne({ email: user.email }).lean()
        if (userDB) {
          const { password: _, ...otherDetails } = userDB

          token = { ...token, ...otherDetails }
        }

        return token
      }

      return token
    },

    async session({ session, token }: any) {
      console.log('- Session -')
      session.user = token

      return session
    },

    async signIn({ user, account, profile }: any) {
      console.log('- Sign In -')

      try {
        // connect to database
        await connectDatabase()

        if (!account || account.provider === 'credentials') {
          return true
        }

        if (!user || !profile) {
          return false
        }

        // get data for authentication
        const email = user.email
        const avatar = user.image
        let firstName: string = ''
        let lastName: string = ''

        if (account.provider === 'google') {
          firstName = profile.given_name
          lastName = profile.family_name
        } else if (account.provider === 'github') {
          firstName = profile.name
          lastName = ''
        }

        // get user from database to check exist
        const existingUser: any = await UserModel.findOneAndUpdate(
          { email },
          { $set: { avatar } },
          { new: true }
        ).lean()

        // check whether user exists
        if (existingUser) {
          return true
        }

        // create new user with google information (auto verified email)
        const newUser = await UserModel.create({
          email,
          avatar,
          firstName,
          lastName,
          authType: account.provider,
        })

        const categories = Object.values(initCategories)
          .flat()
          .map(category => ({
            ...category,
            user: newUser._id,
          }))

        // Insert default categories
        await CategoryModel.insertMany(categories)

        await Promise.all([
          // create initial wallet
          WalletModel.create({
            user: newUser._id,
            name: 'Cash',
            icon: '💰',
          }),
          // initially create settings
          SettingsModel.create({
            user: newUser._id,
          }),
        ])

        return true
      } catch (err: any) {
        console.log(err)
        return false
      }
    },
  },
}

export default authOptions
