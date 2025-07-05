'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setLoading as setBudgetLoading, setBudgets } from '@/lib/reducers/budgetReducer'
import { setCategories, setLoading as setCategoryLoading } from '@/lib/reducers/categoryReducer'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { setStats } from '@/lib/reducers/userReducer'
import {
  setDefaultWallet,
  setLoading as setWalletLoading,
  setWallets,
} from '@/lib/reducers/walletReducer'
import { initApi } from '@/requests'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect } from 'react'

function useInit() {
  // hooks
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const user = session?.user

  // store
  const { refreshPoint } = useAppSelector(state => state.load)
  const { wallets, loading } = useAppSelector(state => state.wallet)

  // fetch wallets, categories, and budgets
  const init = useCallback(async () => {
    if (!user) return

    // start loading
    dispatch(setWalletLoading(true))
    dispatch(setCategoryLoading(true))
    dispatch(setBudgetLoading(true))

    try {
      const { wallets, categories, budgets } = await initApi()
      dispatch(setWallets(wallets))
      dispatch(setCategories(categories))
      dispatch(setBudgets(budgets))
      dispatch(setDefaultWallet(wallets.length > 0 ? wallets[0] : null))
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      dispatch(setWalletLoading(false))
      dispatch(setCategoryLoading(false))
      dispatch(setBudgetLoading(false))
      dispatch(setRefreshing(false))
    }
  }, [dispatch, user])

  // watch refresh point change event
  useEffect(() => {
    dispatch(setStats(null))
  }, [dispatch, refreshPoint])

  // initially get wallets
  useEffect(() => {
    init()
  }, [init, refreshPoint])

  return { refetch: init, wallets, loading }
}

export default useInit
