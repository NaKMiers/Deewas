import CreateCategoryDrawer from '@/components/dialogs/CreateCategoryDrawer'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { AnimatePresence, motion } from 'framer-motion'
import { LucideEllipsisVertical, LucidePlus, LucidePlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import TransactionCategoryGroup from './TransactionCategoryGroup'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

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
  } = useAppSelector(state => state.settings)

  // states
  const [open, setOpen] = useState<boolean>(true)
  const [hasMounted, setHasMounted] = useState(false)

  // values
  const { Icon, background, border } = checkTranType(type)
  const total = categoryGroups.reduce((total, group) => total + group.category.amount, 0)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className={cn('mt-21/2 flex flex-col gap-21/2 md:mt-21', className)}>
      {/* Type Group */}
      <div className="">
        {/* Type Header */}
        <div
          className={cn(
            'flex w-full cursor-pointer items-center gap-21/2 border border-l-[3px] bg-secondary/30 py-1 pl-21/2 pr-1',
            border
          )}
          onClick={() => setOpen(!open)}
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
            <span className="text-sm font-semibold tracking-tight">
              {formatCurrency(currency, total)}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6"
              >
                <LucideEllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-w-max p-0">
              <CreateTransactionDrawer
                type={type}
                refetch={refetch}
                trigger={
                  <Button
                    variant="ghost"
                    className="flex h-8 w-full items-center justify-start gap-2 px-2 font-normal"
                  >
                    <LucidePlusCircle size={16} />
                    Add Transaction
                  </Button>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Type Body */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={hasMounted && { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-1.5 flex flex-col gap-2"
            >
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
                <CreateCategoryDrawer
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TransactionTypeGroup
