import { createWallet, deleteWallet, getWallets, transfer } from '@/app/api/wallet'
import { updateWallet } from '@/app/api/wallet/'
import { Message } from '@/components/ai/message'
import WalletCard from '@/components/WalletCard'
import { CoreMessage, generateId } from 'ai'
import { getMutableAIState } from 'ai/rsc'
import { z } from 'zod'

// MARK: Get all wallets
export const get_all_wallets = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'get all wallets of the user',
    parameters: z.object({}),
    generate: async function* ({}) {
      const toolCallId = generateId()

      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'get_all_wallets',
                args: {},
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'get_all_wallets',
                toolCallId,
                result: `Wallets are shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={
              <div className="flex flex-col gap-1.5">
                {wallets.map(w => (
                  <WalletCard
                    wallet={w}
                    key={w._id}
                  />
                ))}
              </div>
            }
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to get wallets: ${err.message}`}
          />
        )
      }
    },
  }
}

// MARK: Get wallet
export const get_wallet = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'get a wallet by name',
    parameters: z.object({
      name: z.string(),
    }),
    generate: async function* ({ name }: { name: string }) {
      const toolCallId = generateId()

      const { wallets }: { wallets: any[] } = await getWallets(userId)
      const wallet = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

      if (!wallet) {
        return (
          <Message
            role="assistant"
            content={`❌ No wallet found with name "${name}"`}
          />
        )
      }

      messages.done([
        ...(messages.get() as CoreMessage[]),
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              toolCallId,
              toolName: 'get_wallet',
              args: { name },
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              type: 'tool-result',
              toolName: 'get_wallet',
              toolCallId,
              result: `Wallet is shown on the screen`,
            },
          ],
        },
      ])

      return (
        <Message
          role="assistant"
          content={<WalletCard wallet={wallet} />}
        />
      )
    },
  }
}

// MARK: Create wallet
export const create_wallet = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'create a wallet with the following properties: name, user, icon',
    parameters: z.object({
      name: z.string(),
      icon: z.string(),
    }),
    generate: async function* ({ name, icon }: { name: string; icon: string }) {
      const toolCallId = generateId()

      try {
        const { wallet } = await createWallet(userId, name, icon)

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'create_wallet',
                args: { name, icon },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'create_wallet',
                toolCallId,
                result: `The wallet has been created and shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={<WalletCard wallet={wallet} />}
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to create wallet: ${err.message}`}
          />
        )
      }
    },
  }
}

// MARK: Delete wallet
export const delete_wallet = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'delete a wallet by name',
    parameters: z.object({
      name: z.string(),
    }),
    generate: async function* ({ name }: { name: string }) {
      const toolCallId = generateId()

      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const walletToDelete: any = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

        if (!walletToDelete) {
          return (
            <Message
              role="assistant"
              content={`❌ No wallet found with name "${name}"`}
            />
          )
        }

        const { wallet } = await deleteWallet(userId, walletToDelete._id)

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'delete_wallet',
                args: { name },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'delete_wallet',
                toolCallId,
                result: `Wallet "${wallet.name}" has been deleted.`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={`Wallet "${wallet.name}" has been deleted.`}
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to delete wallet: ${err.message}`}
          />
        )
      }
    },
  }
}

// MARK: Update wallet
export const update_wallet = (userId: string) => {
  const messages = getMutableAIState('messages')

  return {
    description: 'update wallet by name',
    parameters: z.object({
      name: z.string(),
      newName: z.string(),
      icon: z.string(),
    }),
    generate: async function* ({
      name,
      newName,
      icon,
    }: {
      name: string
      newName: string
      icon: string
    }) {
      const toolCallId = generateId()

      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)
        const walletToUpdate: any = wallets.find(w => w.name.toLowerCase() === name.toLowerCase())

        if (!walletToUpdate) {
          return (
            <Message
              role="assistant"
              content={`❌ No wallet found with name "${name}"`}
            />
          )
        }

        const { wallet }: any = await updateWallet(
          walletToUpdate._id,
          newName,
          icon,
          walletToUpdate.hide
        )

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'update_wallet',
                args: { name, icon },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'update_wallet',
                toolCallId,
                result: `The wallet has been created and shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={<WalletCard wallet={wallet} />}
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to create wallet: ${err.message}`}
          />
        )
      }
    },
  }
}

// MARK: Transfer funds from one wallet to another
export const transfer_fund_from_wallet_to_wallet = (userId: string) => {
  const messages = getMutableAIState('messages')
  return {
    description: 'transfer funds from one wallet to another',
    parameters: z.object({
      fromWalletName: z.string(),
      toWalletName: z.string(),
      amount: z.number(),
      date: z.string(),
    }),
    generate: async function* ({
      fromWalletName,
      toWalletName,
      amount,
      date,
    }: {
      fromWalletName: string
      toWalletName: string
      amount: number
      date: string
    }) {
      const toolCallId = generateId()

      try {
        const { wallets }: { wallets: any[] } = await getWallets(userId)

        const sourceWallet = wallets.find(w => w.name.toLowerCase() === fromWalletName.toLowerCase())

        if (!sourceWallet) {
          return (
            <Message
              role="assistant"
              content={`❌ No wallet found with name "${fromWalletName}"`}
            />
          )
        }

        const destinationWallet = wallets.find(w => w.name.toLowerCase() === toWalletName.toLowerCase())

        if (!destinationWallet) {
          return (
            <Message
              role="assistant"
              content={`❌ No wallet found with name "${toWalletName}"`}
            />
          )
        }

        const { sourceWallet: sW, destinationWallet: dW } = await transfer(
          userId,
          sourceWallet._id,
          destinationWallet._id,
          amount,
          date || new Date().toISOString()
        )

        messages.done([
          ...(messages.get() as CoreMessage[]),
          {
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId,
                toolName: 'transfer_fund_from_wallet_to_wallet',
                args: { fromWalletName, toWalletName, amount, date },
              },
            ],
          },
          {
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolName: 'transfer_fund_from_wallet_to_wallet',
                toolCallId,
                result: `The wallet has been created and shown on the screen`,
              },
            ],
          },
        ])

        return (
          <Message
            role="assistant"
            content={
              <div className="flex flex-col gap-1.5">
                <WalletCard wallet={sW} />
                <WalletCard wallet={dW} />
              </div>
            }
          />
        )
      } catch (err: any) {
        return (
          <Message
            role="assistant"
            content={`❌ Failed to transfer fund: ${err.message}`}
          />
        )
      }
    },
  }
}
