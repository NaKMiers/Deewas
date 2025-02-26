'use client'

import { useAppDispatch } from '@/hooks/reduxHook'
import { setCurWallet, setLoading, setWallets } from '@/lib/reducers/walletReducer'
import { getMyWalletsApi } from '@/requests'
import { useEffect } from 'react'

function UseWallets() {
  // hooks
  const dispatch = useAppDispatch()

  // get wallets
  useEffect(() => {
    async function getWallets() {
      // start loading
      dispatch(setLoading(true))

      try {
        const { wallets } = await getMyWalletsApi()
        dispatch(setWallets(wallets))
        dispatch(setCurWallet(wallets[0]))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        dispatch(setLoading(false))
      }
    }

    getWallets()
  }, [dispatch])

  return null
}

export default UseWallets
