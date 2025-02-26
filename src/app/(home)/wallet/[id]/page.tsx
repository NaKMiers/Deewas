'use client'

import CreateCategoryDialog from '@/components/CreateCategoryDialog'
import { Button } from '@/components/ui/button'
import { WalletCard } from '@/components/Wallets'
import { ICategory } from '@/models/CategoryModel'
import { IWallet } from '@/models/WalletModel'
import { getWalletApi } from '@/requests'
import { LucidePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function WalletPage({ params }: { params: Promise<{ id: string }> }) {
  // states
  const [wallet, setWallet] = useState<IWallet | null>(null)
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState<boolean>(false)

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

        setWallet(wallet)
        setCategories(categories)
      } catch (err: any) {
        toast.error(err.message)
        console.error(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getWallet()
  }, [params])

  return (
    <div>
      {wallet && (
        <WalletCard
          wallet={wallet}
          className="p-21/2"
        />
      )}

      <CreateCategoryDialog
        update={setCategories}
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(58px)] right-2 h-10 rounded-full"
          >
            <LucidePlus size={24} />
            Add Category
          </Button>
        }
      />
    </div>
  )
}

export default WalletPage
