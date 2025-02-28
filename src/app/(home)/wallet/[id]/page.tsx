'use client'

import CreateCategoryDialog from '@/components/dialogs/CreateCategoryDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import WalletCard from '@/components/WalletCard'
import WalletCategories from '@/components/WalletCategories'
import { SkeletonWallets } from '@/components/Wallets'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setWallet, setWalletCategories } from '@/lib/reducers/walletReducer'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { getWalletApi } from '@/requests'
import { Separator } from '@radix-ui/react-select'
import { LucidePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function WalletPage({ params }: { params: Promise<{ id: string }> }) {
  // hooks
  const dispatch = useAppDispatch()

  // store
  const { walletCategories: categories, wallet }: any = useAppSelector(state => state.wallet)

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [groups, setGroups] = useState<{
    [key: string]: ICategory[]
  }>({})

  // get wallet
  useEffect(() => {
    const getWallet = async () => {
      // stat loading
      setLoading(true)

      try {
        const { id } = await params
        const { wallet, categories } = await getWalletApi(id)
        console.log('Wallet:', wallet)
        console.log('Categories:', categories)

        dispatch(setWallet(wallet))
        dispatch(setWalletCategories(categories))
      } catch (err: any) {
        toast.error('Failed to get wallet')
        console.error(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getWallet()
  }, [dispatch, params])

  // auto group categories by type
  useEffect(() => {
    // group categories by type
    const groupedCategories = categories.reduce((acc: any, category: any) => {
      if (!acc[category.type]) {
        acc[category.type] = []
      }

      acc[category.type].push(category)

      return acc
    }, {})

    setGroups(groupedCategories)
  }, [categories])

  return (
    <div className="p-21/2 md:p-21">
      {/* Wallet */}
      <SkeletonWallets
        className="px-0 md:px-0"
        loading={loading}
      >
        {wallet && (
          <WalletCard
            className="p-0"
            wallet={wallet}
          />
        )}
      </SkeletonWallets>

      {/* Categories Groups */}
      {wallet && !loading ? (
        <div className="mt-21 flex flex-col gap-21/2">
          {Object.entries(groups).length > 0 ? (
            Object.entries(groups).map(([type, categories]) => (
              <WalletCategories
                wallet={wallet}
                type={type as TransactionType}
                categories={categories.filter(category => category.type === type)}
                key={type}
              />
            ))
          ) : (
            <div className="flex items-center justify-center rounded-md border border-muted-foreground/50 px-2 py-7">
              <p className="text-center text-lg font-semibold text-muted-foreground/50">
                No categories found. Why not create one?
              </p>
            </div>
          )}
        </div>
      ) : (
        <Skeleton className="mt-21 h-[500px] w-full rounded-lg" />
      )}

      {/* Create Category Float Button */}
      {wallet?._id && (
        <CreateCategoryDialog
          walletId={wallet._id}
          update={category => dispatch(setWalletCategories([category, ...categories]))}
          trigger={
            <Button
              variant="default"
              className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full"
            >
              <LucidePlus size={24} />
              Add Category
            </Button>
          }
        />
      )}

      <Separator className="pt-20" />
    </div>
  )
}

export default WalletPage
