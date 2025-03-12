'use client'

import { IFullTransaction } from '@/models/TransactionModel'
import { getMyTransactionsApi } from '@/requests'
import { useCallback, useEffect, useState } from 'react'

export function useMockTransactions() {
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)

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
  }, [fetchTransactions])

  return { transactions, loading, refetch: fetchTransactions }
}
