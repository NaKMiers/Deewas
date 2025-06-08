import { createWallet, deleteWallet, getWallets, transfer } from '@/app/api/wallet'
import { updateWallet } from '@/app/api/wallet/'
import { z } from 'zod'

// MARK: Get all wallets
export const get_all_wallets = (userId: string) => {
  return {
    description: 'get all wallets of the user',
    parameters: z.object({
      message: z.string().describe('E.g Here are all your wallets'),
    }),
    execute: async ({ message }: { message: string }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)

        return { wallets, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to get wallets',
        }
      }
    },
  }
}

// MARK: Get wallet
export const get_wallet = (userId: string) => {
  return {
    description: 'get a wallet by name',
    parameters: z.object({
      name: z.string(),
      message: z.string().describe('E.g Here is your wallet'),
    }),
    execute: async ({ name, message }: { name: string; message: string }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const wallet = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

        if (!wallet) {
          throw {
            errorCode: 'WALLET_NOT_FOUND',
            message: `No wallet found with name "${name}"`,
          }
        }

        return { wallet, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to get wallet',
        }
      }
    },
  }
}

// MARK: Create wallet
export const create_wallet = (userId: string, isPremium: boolean) => {
  return {
    description: 'create a wallet with the following properties: name, user, icon',
    parameters: z.object({
      name: z.string(),
      icon: z.string(),
      message: z.string().describe('E.g Here is your wallet'),
    }),
    execute: async ({ name, icon, message }: { name: string; icon: string; message: string }) => {
      try {
        const { wallet } = await createWallet(userId, isPremium, name, icon)

        return { wallet, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to create wallet',
        }
      }
    },
  }
}

// MARK: Delete wallet
export const delete_wallet = (userId: string) => {
  return {
    description: 'delete a wallet by name',
    parameters: z.object({
      name: z.string(),
      message: z.string().describe('E.g Here is your wallet'),
    }),
    execute: async ({ name, message }: { name: string; message: string }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const walletToDelete: any = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

        if (!walletToDelete) {
          throw {
            errorCode: 'WALLET_NOT_FOUND',
            message: `No wallet found with name "${name}"`,
          }
        }

        const { wallet } = await deleteWallet(userId, walletToDelete._id)

        return { wallet, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to delete wallet',
        }
      }
    },
  }
}

// MARK: Update wallet
export const update_wallet = (userId: string) => {
  return {
    description: 'update wallet by name',
    parameters: z.object({
      name: z.string(),
      newName: z.string(),
      icon: z.string(),

      message: z.string().describe('E.g Here is your wallet'),
    }),
    execute: async ({
      name,
      newName,
      icon,
      message,
    }: {
      name: string
      newName: string
      icon: string
      message: string
    }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const walletToUpdate: any = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

        if (!walletToUpdate) {
          throw {
            errorCode: 'WALLET_NOT_FOUND',
            message: `No wallet found with name "${name}"`,
          }
        }

        const { wallet }: any = await updateWallet(
          walletToUpdate._id,
          newName,
          icon,
          walletToUpdate.exclude
        )

        return { wallet, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to update wallet',
        }
      }
    },
  }
}

// MARK: Transfer funds from one wallet to another
export const transfer_fund_from_wallet_to_wallet = (userId: string) => {
  return {
    description: 'transfer funds from one wallet to another',
    parameters: z.object({
      fromWalletName: z.string(),
      toWalletName: z.string(),
      amount: z.number(),
      date: z.string(),
      message: z.string().describe('E.g Here are your wallets'),
    }),
    execute: async ({
      fromWalletName,
      toWalletName,
      amount,
      date,
      message,
    }: {
      fromWalletName: string
      toWalletName: string
      amount: number
      date: string
      message: string
    }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)

        const sourceWallet = wallets.find(w => w.name.toLowerCase() === fromWalletName.toLowerCase())
        if (!sourceWallet) {
          throw {
            errorCode: 'WALLET_NOT_FOUND',
            message: `No wallet found with name "${fromWalletName}"`,
          }
        }

        const destinationWallet = wallets.find(w => w.name.toLowerCase() === toWalletName.toLowerCase())
        if (!destinationWallet) {
          throw {
            errorCode: 'WALLET_NOT_FOUND',
            message: `No wallet found with name "${toWalletName}"`,
          }
        }

        const { sourceWallet: sW, destinationWallet: dW } = await transfer(
          userId,
          sourceWallet._id,
          destinationWallet._id,
          amount,
          date || new Date().toISOString()
        )

        return { sourceWallet: sW, destinationWallet: dW, message }
      } catch (err: any) {
        const code = err.errorCode
        return {
          errorCode: code || '',
          error: code ? err.message : 'Failed to transfer fund',
        }
      }
    },
  }
}
