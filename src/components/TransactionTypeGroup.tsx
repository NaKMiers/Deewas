import CreateCategoryDialog from '@/components/dialogs/CreateCategoryDialog'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatSymbol } from '@/lib/string'
import { cn } from '@/lib/utils'
import { LucidePlus, LucideTrendingUp } from 'lucide-react'
import TransactionCategoryGroup from './TransactionCategoryGroup'
import { TransactionType } from '@/models/TransactionModel'

interface ITransactionTypeGroupProps {
  type: TransactionType
  categoryGroups: any[]
  className?: string
}

function TransactionTypeGroup({ type, categoryGroups, className = '' }: ITransactionTypeGroupProps) {
  // store
  const curWallet: any = useAppSelector(state => state.wallet.curWallet)

  // values
  const { Icon, color, background, border } = checkTranType(type)

  return (
    <div className={cn('mt-21/2 flex flex-col gap-21/2 px-21/2 md:mt-21 md:px-21', className)}>
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
            <span className="text-lg font-semibold">{formatSymbol('USD') + ' ' + 100000}</span>{' '}
          </div>
        </div>

        {/* Type Body */}
        <div className="mt-1.5 flex flex-col gap-1">
          {/* Category Group */}
          {categoryGroups.map((catGroup, index) => (
            <TransactionCategoryGroup
              category={catGroup.category}
              transactions={catGroup.transactions}
              key={index}
            />
          ))}

          {/* Add Category */}
          {curWallet && (
            <CreateCategoryDialog
              walletId={curWallet._id}
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
