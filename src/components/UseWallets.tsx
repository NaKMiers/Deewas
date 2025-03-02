'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setCurWallet, setLoading, setWallets } from '@/lib/reducers/walletReducer'
import { getMyWalletsApi } from '@/requests'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

function UseWallets() {
  // hooks
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const user: any = session?.user

  // store
  const { refetching } = useAppSelector(state => state.load)

  // get wallets
  useEffect(() => {
    async function getWallets() {
      if (!user) return

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
  }, [dispatch, user, refetching])

  return null
}

export default UseWallets
