import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { IFullBudget } from '@/models/BudgetModel'
import { ICategory } from '@/models/CategoryModel'
import { IFullTransaction } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import BudgetCard from '../BudgetCard'
import Category from '../Category'
import Transaction from '../Transaction'
import { Button } from '../ui/button'
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel'
import WalletCard from '../WalletCard'
import { Markdown } from './Markdown'

interface MessageProps {
  role: 'assistant' | 'user'
  content: string
  parts?: any
}

function Message({ role, content, parts }: MessageProps) {
  const t = useTranslations('ERROR_CODE')
  const router = useRouter()

  const toolInvocations = parts?.[1]?.toolInvocation

  // if tool is invoked, show the result of the tool
  if (toolInvocations && toolInvocations?.result) {
    const { _args, result, _state, _step, _toolCallId, toolName } = toolInvocations
    const message = result?.message || ''
    const errorCode = result?.errorCode

    // check if any error occurred
    if (errorCode) {
      return (
        <>
          <BasicMessage
            role={role}
            content={t(errorCode)}
          />
          {errorCode.includes('LIMIT') && (
            <div className="shadow-md">
              <div className="overflow-hidden rounded-xl">
                <Button
                  className="px-21 py-2"
                  onClick={() => router.push('/premium')}
                >
                  <p className="py-1 text-center font-medium text-neutral-800">Upgrade Now</p>
                </Button>
              </div>
            </div>
          )}
        </>
      )
    }

    switch (toolName) {
      case 'get_all_wallets': {
        const wallets = result?.wallets || []

        // check if any wallets were found
        if (wallets.length <= 0) {
          return (
            <BasicMessage
              role={role}
              content="No wallets found"
            />
          )
        }

        // show a list of wallets
        return (
          <div className="flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <Carousel className={cn('mb-21/2', !message && 'mt-21/2')}>
              <CarouselContent>
                {wallets.map((wallet: IWallet) => (
                  <CarouselItem
                    className={cn('basis-full sm:basis-1/2')}
                    key={wallet._id}
                  >
                    <WalletCard wallet={wallet} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )
      }
      case 'get_wallet':
      case 'create_wallet':
      case 'update_wallet': {
        const wallet = result?.wallet

        // check if wallet was found
        if (!wallet) {
          return (
            <BasicMessage
              role={role}
              content={'No wallet found'}
            />
          )
        }

        // show the wallet details
        return (
          <div className="flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <WalletCard
              wallet={wallet}
              hideMenu
              className={cn('mb-21/2 w-full sm:w-1/2', !message && 'mt-21/2')}
            />
          </div>
        )
      }
      case 'delete_wallet': {
        const wallet = result?.wallet
        // check if wallet was found
        if (!wallet) {
          return (
            <BasicMessage
              role={role}
              content={'No wallet found'}
            />
          )
        }

        // show the message
        return (
          <BasicMessage
            role={role}
            content={`Wallet "${wallet.name}" deleted successfully!`}
          />
        )
      }
      case 'transfer_fund_from_wallet_to_wallet': {
        const sourceWallet = result?.sourceWallet
        const destinationWallet = result?.destinationWallet

        // check if source wallet was found
        if (!sourceWallet) {
          return (
            <BasicMessage
              role={role}
              content={'No source wallet found'}
            />
          )
        }

        // check if destination wallet was found
        if (!destinationWallet) {
          return (
            <BasicMessage
              role={role}
              content={'No destination wallet found'}
            />
          )
        }

        // show the source and destination wallets
        return (
          <div className="flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <Carousel className={cn('mb-21/2', !message && 'mt-21/2')}>
              <CarouselContent>
                {[sourceWallet, destinationWallet].map((wallet: IWallet) => (
                  <CarouselItem
                    className={cn('basis-1/2')}
                    key={wallet._id}
                  >
                    <WalletCard wallet={wallet} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )
      }
      case 'get_all_categories': {
        const categories = result?.categories || []

        // check if any categories were found
        if (categories.length <= 0) {
          return (
            <BasicMessage
              role={role}
              content="No categories found"
            />
          )
        }

        // show a list of wallets
        return (
          <div>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <div className={cn('mb-21/2 flex flex-col gap-1', !message && 'mt-21/2')}>
              {categories.map((c: ICategory) => (
                <Category
                  category={c}
                  hideMenu
                  key={c._id}
                />
              ))}
            </div>
          </div>
        )
      }
      case 'get_category':
      case 'create_category':
      case 'update_category': {
        const category = result?.category

        // check if category was found
        if (!category) {
          return (
            <BasicMessage
              role={role}
              content={'No category found'}
            />
          )
        }

        // show the wallet details
        return (
          <div className="flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <Category
              category={category}
              className={cn('mb-21/2', !message && 'mt-21/2')}
              hideMenu
            />
          </div>
        )
      }
      case 'delete_category': {
        const category = result?.category
        // check if category was found
        if (!category) {
          return (
            <BasicMessage
              role={role}
              content={'No category found'}
            />
          )
        }

        // show the message
        return (
          <BasicMessage
            role={role}
            content={`Category "${category.name}" deleted successfully!`}
          />
        )
      }
      case 'get_all_budgets': {
        const budgets = result?.budgets || []

        // check if any budgets were found
        if (budgets.length <= 0) {
          return (
            <BasicMessage
              role={role}
              content="No budgets found"
            />
          )
        }

        // show a list of wallets
        return (
          <div className="flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <div className={cn('mb-21/2', !message && 'mt-21/2')}>
              {budgets.map((b: IFullBudget) => (
                <BudgetCard
                  budget={b}
                  begin={b.begin}
                  end={b.end}
                  hideMenu
                  key={b._id}
                />
              ))}
            </div>
          </div>
        )
      }
      case 'create_budget':
      case 'update_budget': {
        const budget = result?.budget

        // check if budget was found
        if (!budget) {
          return (
            <BasicMessage
              role={role}
              content={'No budget found'}
            />
          )
        }

        // show the wallet details
        return (
          <div className="flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <BudgetCard
              budget={budget}
              begin={budget.begin}
              end={budget.end}
              hideMenu
              className={cn('mb-21/2', !message && 'mt-21/2')}
            />
          </div>
        )
      }
      case 'delete_budget': {
        const budget = result?.budget
        // check if budget was found
        if (!budget) {
          return (
            <BasicMessage
              role={role}
              content={'No budget found'}
            />
          )
        }

        // show the message
        return (
          <BasicMessage
            role={role}
            content={`Budget for category ${budget.category.name} with total ${budget.total} deleted successfully!`}
          />
        )
      }
      case 'get_all_transactions': {
        const transactions = result?.transactions || []

        // check if any transactions were found
        if (transactions.length <= 0) {
          return (
            <BasicMessage
              role={role}
              content="No transactions found"
            />
          )
        }

        // show a list of transactions
        return (
          <div className="flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            {transactions.map((t: IFullTransaction) => (
              <Transaction
                transaction={t}
                hideMenu
                key={t._id}
              />
            ))}
          </div>
        )
      }
      case 'get_transaction':
      case 'get_most_transaction':
      case 'create_transaction':
      case 'update_transaction': {
        const transaction = result?.transaction

        // check if transaction was found
        if (!transaction) {
          return (
            <BasicMessage
              role={role}
              content={'No transaction found'}
            />
          )
        }

        // show the wallet details
        return (
          <div className="flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <Transaction
              transaction={transaction}
              hideMenu
              className={cn('mb-21/2', !message && 'mt-21/2')}
            />
          </div>
        )
      }
      case 'delete_transaction': {
        const transaction = result?.transaction
        // check if transaction was found
        if (!transaction) {
          return (
            <BasicMessage
              role={role}
              content={'No transaction found'}
            />
          )
        }

        // show the message
        return (
          <BasicMessage
            role={role}
            content={`Transaction "${transaction.name}" deleted successfully!`}
          />
        )
      }
    }
  }

  return (
    <BasicMessage
      role={role}
      content={content}
    />
  )
}

function BasicMessage({ role, content }: MessageProps) {
  return (
    <p
      className={cn(
        'flex items-center gap-21/2',
        role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      <p
        className={cn(
          'flex-col gap-1 py-1.5',
          role === 'assistant'
            ? 'flex-1'
            : 'items-end rounded-[26px] rounded-br-xl border border-primary/10 bg-secondary px-4'
        )}
      >
        {typeof content === 'string' ? <Markdown>{content}</Markdown> : content}
      </p>
    </p>
  )
}

export default memo(Message)
