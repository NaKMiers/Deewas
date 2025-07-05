import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory } from '@/models/CategoryModel'
import { IFullTransaction } from '@/models/TransactionModel'
import { motion } from 'framer-motion'
import { LucideChartColumn, LucidePlusSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import TxItem from './TxItem'
import { useRouter } from '@/i18n/navigation'

interface ITransactionCategoryGroupProps {
  category: ICategory
  transactions: IFullTransaction[]
  includeTransfers?: boolean
  className?: string
}

function TransactionCategoryGroup({
  category,
  transactions,
  includeTransfers,
  className,
}: ITransactionCategoryGroupProps) {
  // hooks
  const t = useTranslations('transactionCategoryGroup')
  const router = useRouter()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  return (
    <div
      onClick={() => router.push(`/category-history/${category?._id}`)}
      className={cn('trans-200 flex cursor-pointer flex-col hover:opacity-80', className)}
    >
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="flex items-start gap-2">
          <span>{category.icon}</span>
          {currency && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{category.name}</span>
              <span
                className={cn(
                  '-mb-1 -mt-0.5 ml-0.5 text-xs tracking-tight',
                  checkTranType(category.type).color
                )}
              >
                {formatCurrency(
                  currency,
                  transactions
                    .filter(t => !t.exclude || includeTransfers)
                    .reduce((total, tx) => total + tx.amount, 0)
                )}
              </span>
            </div>
          )}
        </div>

        {/* MARK: New Transaction for category */}
        <div className="flex items-center gap-2">
          <CreateTransactionDrawer
            initCategory={category}
            trigger={
              <Button
                onClick={e => e.stopPropagation()}
                variant="outline"
                className="flex h-7 items-center gap-1.5 rounded-md border border-primary/10 bg-secondary px-2 text-xs"
              >
                <LucidePlusSquare />
                {t('Add Transaction')}
              </Button>
            }
          />
          <Button
            variant="outline"
            className="flex h-7 w-10 items-center gap-1.5 rounded-md border border-primary/10 bg-secondary px-2 text-xs"
          >
            <LucideChartColumn />
          </Button>
        </div>
      </div>

      {/*  MARK: Transactions of category */}
      <div className="my-1.5 pl-2">
        <div className={cn('flex flex-col gap-0 border-l-2', checkTranType(category.type).border)}>
          {transactions.map((tx, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              key={tx._id}
            >
              <TxItem transaction={tx} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(TransactionCategoryGroup)
