import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const transaction = createSlice({
  name: 'transaction',
  initialState: {
    transactions: [] as any[],
    loading: false as boolean,
  },
  reducers: {
    setTransactions: (state, action: PayloadAction<any>) => {
      state.transactions = action.payload
    },
    addTransaction: (state, action: PayloadAction<any>) => {
      state.transactions.push(action.payload)
    },
    updateTransaction: (state, action: PayloadAction<any>) => {
      state.transactions = state.transactions.map(transaction =>
        transaction._id === action.payload._id ? action.payload : transaction
      )
    },
    deleteTransaction: (state, action: PayloadAction<any>) => {
      state.transactions = state.transactions.filter(
        transaction => transaction._id !== action.payload._id
      )
    },
    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },
  },
})

export const { setTransactions, addTransaction, updateTransaction, deleteTransaction, setLoading } =
  transaction.actions
export default transaction.reducer
