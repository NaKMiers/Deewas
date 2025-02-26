'use client'

import { WalletCard } from '@/components/Wallets'
import { ICategory } from '@/models/CategoryModel'
import { IWallet } from '@/models/WalletModel'
import { getWalletApi } from '@/requests'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function WalletPage({ params: { id } }: { params: { id: string } }) {
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
  }, [id])

  return (
    <div>
      {wallet && (
        <WalletCard
          wallet={wallet}
          className="p-21/2"
        />
      )}
    </div>
  )
}

export default WalletPage
