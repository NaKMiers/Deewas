import CreateCategoryDialog from '@/components/dialogs/CreateCategoryDialog'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { LucidePlus } from 'lucide-react'
import TransactionCategoryGroup from './TransactionCategoryGroup'

interface ITransactionTypeGroupProps {
  type: TransactionType
  categoryGroups: any[]
  refetch?: () => void
  className?: string
}

function TransactionTypeGroup({
  type,
  categoryGroups,
  refetch,
  className = '',
}: ITransactionTypeGroupProps) {
  // store
  const curWallet: any = useAppSelector(state => state.wallet.curWallet)
  const {
    settings: { currency },
    exchangeRates,
  } = useAppSelector(state => state.settings)

  // values
  const { Icon, background, border } = checkTranType(type)
  const total = categoryGroups.reduce((total, group) => total + group.category.amount, 0)

  return (
    <div className={cn('mt-21/2 flex flex-col gap-21/2 md:mt-21', className)}>
      {/* Type Group */}
      <div className="">
        {/* Type Header */}
        <div
          className={cn(
            'flex w-full items-center gap-21/2 border border-l-[3px] bg-secondary/30 px-21/2 py-1',
            border
          )}
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md border-2 text-white',
              background,
              border
            )}
          >
            <Icon size={24} />
          </div>

          <div className="flex flex-1 flex-col">
            <p className="text-sm font-semibold capitalize md:text-2xl">{type + 's'}</p>
            <p className="text-xs font-semibold text-muted-foreground">Sorted by date</p>
          </div>

          <div>
            <span className="text-base font-semibold tracking-tight">
              {formatCurrency(currency, total, exchangeRates[currency])}
            </span>{' '}
          </div>
        </div>

        {/* Type Body */}
        <div className="mt-1.5 flex flex-col gap-2">
          {/* Category Group */}
          {categoryGroups.map((catGroup, index) => (
            <TransactionCategoryGroup
              category={catGroup.category}
              transactions={catGroup.transactions}
              refetch={refetch}
              key={index}
            />
          ))}

          {/* Add Category */}
          {curWallet && (
            <CreateCategoryDialog
              walletId={curWallet._id}
              type={type}
              trigger={
                <Button
                  variant="secondary"
                  className="h-8 text-xs font-semibold"
                >
                  <LucidePlus size={24} />
                  Add Category
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionTypeGroup
