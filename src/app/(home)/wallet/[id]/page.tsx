'use client'

import CreateCategoryDialog from '@/components/dialogs/CreateCategoryDialog'
import { Button } from '@/components/ui/button'
import WalletCard from '@/components/WalletCard'
import WalletCategories from '@/components/WalletCategories'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setWallet, setWalletCategories } from '@/lib/reducers/walletReducer'
import { ICategory } from '@/models/CategoryModel'
import { TransactionType } from '@/models/TransactionModel'
import { IWallet } from '@/models/WalletModel'
import { getWalletApi } from '@/requests'
import { Separator } from '@radix-ui/react-select'
import { LucidePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function WalletPage({ params }: { params: Promise<{ id: string }> }) {
  // hooks
  const dispatch = useAppDispatch()

  // store
  const { walletCategories: categories, wallet } = useAppSelector(state => state.wallet)

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
        toast.error(err.message)
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
      {wallet && (
        <WalletCard
          className="p-0"
          wallet={wallet}
        />
      )}

      {/* Categories Groups */}
      <div className="mt-21 flex flex-col gap-21/2 md:gap-21">
        {wallet &&
          Object.entries(groups).map(([type, categories]) => (
            <WalletCategories
              wallet={wallet}
              type={type as TransactionType}
              categories={categories.filter(category => category.type === type)}
              key={type}
            />
          ))}
      </div>

      {/* Create Category Float Button */}
      {(wallet as any)?._id && (
        <CreateCategoryDialog
          walletId={(wallet as any)._id}
          update={category => dispatch(setWalletCategories([category, ...categories]))}
          trigger={
            <Button
              variant="default"
              className="fixed bottom-[calc(58px)] right-2 z-20 h-10 rounded-full"
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
