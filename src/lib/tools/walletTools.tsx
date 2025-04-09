import { createWallet, deleteWallet, getWallets, transfer } from '@/app/api/wallet'
import { updateWallet } from '@/app/api/wallet/'
import { Message } from '@/components/ai/message'
import { z } from 'zod'

// MARK: Get all wallets
export const get_all_wallets = (userId: string) => {
  return {
    description: 'get all wallets of the user',
    parameters: z.object({}),
    execute: async () => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)

        return { wallets }
      } catch (err: any) {
        return {
          error: `Failed to get wallets: ${err.message}`,
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
    }),
    execute: async ({ name }: { name: string }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const wallet = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

        if (!wallet) {
          return {
            error: `No wallet found with name "${name}"`,
          }
        }

        return { wallet }
      } catch (err: any) {
        return { error: `Failed to get wallet: ${err.message}` }
      }
    },
  }
}

// MARK: Create wallet
export const create_wallet = (userId: string) => {
  return {
    description: 'create a wallet with the following properties: name, user, icon',
    parameters: z.object({
      name: z.string(),
      icon: z.string(),
    }),
    execute: async ({ name, icon }: { name: string; icon: string }) => {
      try {
        const { wallet } = await createWallet(userId, name, icon)

        return { wallet }
      } catch (err: any) {
        return { error: `Failed to create wallet: ${err.message}` }
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
    }),
    execute: async ({ name }: { name: string }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const walletToDelete: any = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

        if (!walletToDelete) {
          return (
            <Message
              role="assistant"
              content={`No wallet found with name "${name}"`}
            />
          )
        }

        const { wallet } = await deleteWallet(userId, walletToDelete._id)

        return { wallet }
      } catch (err: any) {
        return { error: `Failed to delete wallet: ${err.message}` }
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
    }),
    execute: async ({ name, newName, icon }: { name: string; newName: string; icon: string }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const walletToUpdate: any = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

        if (!walletToUpdate) {
          return (
            <Message
              role="assistant"
              content={`No wallet found with name "${name}"`}
            />
          )
        }

        const { wallet }: any = await updateWallet(
          walletToUpdate._id,
          newName,
          icon,
          walletToUpdate.hide
        )

        return { wallet }
      } catch (err: any) {
        return { error: `Failed to update wallet: ${err.message}` }
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
    }),
    execute: async ({
      fromWalletName,
      toWalletName,
      amount,
      date,
    }: {
      fromWalletName: string
      toWalletName: string
      amount: number
      date: string
    }) => {
      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)

        const sourceWallet = wallets.find(w => w.name.toLowerCase() === fromWalletName.toLowerCase())

        if (!sourceWallet) {
          return { error: `No wallet found with name "${fromWalletName}"` }
        }

        const destinationWallet = wallets.find(w => w.name.toLowerCase() === toWalletName.toLowerCase())

        if (!destinationWallet) {
          return { error: `No wallet found with name "${toWalletName}"` }
        }

        const { sourceWallet: sW, destinationWallet: dW } = await transfer(
          userId,
          sourceWallet._id,
          destinationWallet._id,
          amount,
          date || new Date().toISOString()
        )

        return { sourceWallet: sW, destinationWallet: dW }
      } catch (err: any) {
        return {
          error: `Failed to transfer fund: ${err.message}`,
        }
      }
    },
  }
}
