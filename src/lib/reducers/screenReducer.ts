import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import moment from 'moment'

const initialState = {
  // wallet
  walletToEdit: null as IWallet | null,
  fromWallet: null as IWallet | null,
  toWallet: null as IWallet | null,
  selectedWallet: null as IWallet | null,
  ofWallet: null as IWallet | null,

  // category
  categoryToEdit: null as ICategory | null,
  selectedCategory: null as ICategory | null,

  // transaction
  transactionToEdit: null as IFullTransaction | null,

  // category
  budgetToEdit: null as IFullBudget | null,

  // emoji
  selectedEmoji: '' as string,

  // date range
  dateRange: {
    from: moment().startOf('month').toISOString(),
    to: moment().endOf('month').toISOString(),
  },

  // clear chat confirmation
  clearChat: false as boolean,
}

export const screen = createSlice({
  name: 'screen',
  initialState,
  reducers: {
    // wallet
    setWalletToEdit: (state, action: PayloadAction<IWallet | null>) => {
      state.walletToEdit = action.payload
    },
    setFromWallet: (state, action: PayloadAction<IWallet | null>) => {
      state.fromWallet = action.payload
    },
    setToWallet: (state, action: PayloadAction<IWallet | null>) => {
      state.toWallet = action.payload
    },
    setSelectedWallet: (state, action: PayloadAction<IWallet | null>) => {
      state.selectedWallet = action.payload
    },
    setOfWallet: (state, action: PayloadAction<IWallet | null>) => {
      state.ofWallet = action.payload
    },

    // category
    setCategoryToEdit: (state, action: PayloadAction<ICategory | null>) => {
      state.categoryToEdit = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<ICategory | null>) => {
      state.selectedCategory = action.payload
    },

    // transaction
    setTransactionToEdit: (state, action: PayloadAction<IFullTransaction | null>) => {
      state.transactionToEdit = action.payload
    },

    // budget
    setBudgetToEdit: (state, action: PayloadAction<IFullBudget | null>) => {
      state.budgetToEdit = action.payload
    },

    // emoji
    setSelectedEmoji: (state, action: PayloadAction<string>) => {
      state.selectedEmoji = action.payload
    },

    // date range
    setDateRange: (state, action: PayloadAction<{ from: string; to: string }>) => {
      state.dateRange = action.payload
    },
    setFromDate: (state, action: PayloadAction<string>) => {
      state.dateRange.from = action.payload
    },
    setToDate: (state, action: PayloadAction<string>) => {
      state.dateRange.to = action.payload
    },
    resetDateRange: state => {
      state.dateRange = {
        from: moment().startOf('month').toISOString(),
        to: moment().endOf('month').toISOString(),
      }
    },

    // clear chat confirmation
    setClearChat(state, action: PayloadAction<boolean>) {
      state.clearChat = action.payload
    },

    // reset
    resetScreen: () => initialState,
  },
})

export const {
  // wallet
  setWalletToEdit,
  setFromWallet,
  setToWallet,
  setSelectedWallet,
  setOfWallet,

  // category
  setCategoryToEdit,
  setSelectedCategory,

  // transaction
  setTransactionToEdit,

  // budget
  setBudgetToEdit,

  // emoji
  setSelectedEmoji,

  // date range
  setDateRange,
  setFromDate,
  setToDate,
  resetDateRange,

  // clear chat confirmation
  setClearChat,

  // reset
  resetScreen,
} = screen.actions

export default screen.reducer
