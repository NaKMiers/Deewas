import { connectDatabase } from '@/config/database'
import UserModel from '@/models/UserModel'
import bcrypt from 'bcrypt'
import { SessionStrategy } from 'next-auth'

// Models: Wallet, Category, Settings, User
import '@/models/CategoryModel'
import '@/models/SettingsModel'
import '@/models/UserModel'
import '@/models/WalletModel'

// Providers
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

const isProd = process.env.NODE_ENV === 'production'

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  useSecureCookies: isProd,

  cookies: isProd
    ? {
        pkceCodeVerifier: {
          name: '__Secure-next-auth.pkce.code_verifier',
          options: {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
          },
        },
      }
    : {},

  // debug: process.env.NODE_ENV === 'development',
  providers: [
    // GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // APPLE
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID_WEB!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'email name',
          response_mode: 'form_post',
          response_type: 'code id_token',
        },
      },
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
          throw new Error('Missing credentials')
        }

        // get data from credentials
        const { usernameOrEmail, password } = credentials

        // find user from database
        const user: any = await UserModel.findOne({
          $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
        }).lean()

        // check if account is deleted or not
        if (user && user.isDeleted) {
          throw new Error('This account has been deleted')
        }

        // check user exists or not in database
        if (!user) {
          throw new Error('Incorrect username or email')
        }

        // user does not have password
        if (!user.password) {
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
        return { ...otherDetails, image }
      },
    }),

    // ...add providers here
  ],

  callbacks: {
    // MARK: JWT
    async jwt({ token, user, trigger, session }: any) {
      console.log('- JWT -')

      if (trigger === 'update' && token.email) {
        console.log('- Update User -')
        const userDB: any = await UserModel.findOne({ email: token.email }).lean()
        if (userDB) {
          const { password: _, ...otherDetails } = userDB

          return JSON.parse(JSON.stringify({ ...token, ...otherDetails }))
        }
      }

      if (user) {
        console.log('- Login -')
        const userDB: any = await UserModel.findOne({ email: user.email }).lean()
        if (userDB) {
          const { password: _, ...otherDetails } = userDB

          token = { ...token, ...otherDetails }
        }

        return JSON.parse(JSON.stringify(token))
      }

      // if (token) {
      //   console.log('- Refresh -')
      //   const userDB: any = await UserModel.findOne({ email: token.email }).lean()
      //   if (userDB) {
      //     const { password: _, ...otherDetails } = userDB

      //     token = { ...token, ...otherDetails }
      //   }

      //   return JSON.parse(JSON.stringify(token))
      // }

      return token
    },

    // MARK: Session
    async session({ session, token }: any) {
      console.log('- Session -')
      session.user = token

      return session
    },

    // MARK: Sign In
    async signIn({ user, account, profile }: any) {
      console.log('- Sign In -')
      console.log('Account:', account)
      console.log('Profile:', profile)

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

        let filter = {}

        if (account.provider === 'google') {
          filter = { $or: [{ email }, { googleUserId: account.providerAccountId }] }
        }
        if (account.provider === 'apple') {
          filter = { $or: [{ email }, { appleUserId: account.providerAccountId }] }
        }

        // get user from database to check exist
        const existingUser: any = await UserModel.findOneAndUpdate(
          filter,
          { $set: { avatar } },
          { new: true }
        ).lean()

        // user not found
        if (!existingUser || existingUser.isDeleted) {
          return false
        }

        // // MARK: Create new user and init data
        // // create new user with google information (auto verified email)
        // const newUser = await UserModel.create({
        //   email,
        //   avatar,
        //   authType: account.provider,
        // })

        // const categories = Object.values(initCategories)
        //   .flat()
        //   .map(category => ({
        //     ...category,
        //     user: newUser._id,
        //   }))

        // // Insert default categories
        // await CategoryModel.insertMany(categories)

        // await Promise.all([
        //   // create initial wallet
        //   WalletModel.create({
        //     user: newUser._id,
        //     name: 'Cash',
        //     icon: '💰',
        //   }),
        //   // initially create settings
        //   SettingsModel.create({
        //     user: newUser._id,
        //   }),
        // ])

        return true
      } catch (err: any) {
        console.log(err)
        return false
      }
    },
  },
}

export default authOptions
