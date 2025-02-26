import { Button } from '@/components/ui/button'
import { formatSymbol } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { IFullTransaction } from '@/models/TransactionModel'
import { LucideChevronUp, LucidePlusSquare } from 'lucide-react'
import CreateTransactionDialog from './dialogs/CreateTransactionDialog'

interface ITransactionCategoryGroupProps {
  category: ICategory
  transactions: IFullTransaction[]
  className?: string
}

function TransactionCategoryGroup({
  category,
  transactions,
  className = '',
}: ITransactionCategoryGroupProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="flex items-center gap-2">
          <span>{category.icon}</span>
          <p className="text-sm font-semibold">{category.name}</p>
        </div>

        {/* New Transaction for category */}
        <CreateTransactionDialog
          trigger={
            <Button
              variant="outline"
              className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs"
            >
              <LucidePlusSquare />
              New Transaction
            </Button>
          }
        />
      </div>

      {/* Transactions of category */}
      <div className="flex flex-col pl-2">
        {transactions.map(transaction => (
          <Transaction
            transaction={transaction}
            key={transaction._id}
          />
        ))}
      </div>
    </div>
  )
}

export default TransactionCategoryGroup

interface ITransactionProps {
  transaction: IFullTransaction
  className?: string
}

function Transaction({ transaction, className = '' }: ITransactionProps) {
  return (
    <div className={cn('flex w-full items-center justify-between gap-2 pl-2', className)}>
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold">{transaction.name}</p>
      </div>

      <div className="flex items-center gap-1 text-emerald-500">
        <LucideChevronUp size={16} />
        <span className="text-sm font-semibold">{formatSymbol('USD') + ' ' + 2000}</span>
      </div>
    </div>
  )
}
