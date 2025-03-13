'use client'

import { IFullTransaction } from '@/models/TransactionModel'
import { getMyTransactionsApi } from '@/requests'
import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from './reduxHook'

export function useMockTransactions() {
  // states
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // store
  const { refetching: rfc } = useAppSelector(state => state.load)

  const fetchTransactions = useCallback(async () => {
    // start loading
    setLoading(true)

    try {
      const { transactions } = await getMyTransactionsApi()
      setTransactions(transactions)
    } catch (err: any) {
      console.error(err)
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions, rfc])

  return { transactions, loading, refetch: fetchTransactions }
}
