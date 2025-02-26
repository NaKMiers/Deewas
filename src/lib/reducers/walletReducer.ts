import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const wallet = createSlice({
  name: 'wallet',
  initialState: {
    // for (home)
    curWallet: null,
    wallets: [],
    loading: false,

    // for wallet page
    wallet: null,
    walletCategories: [],
  },
  reducers: {
    setWallets: (state, action: PayloadAction<any>) => {
      state.wallets = action.payload
    },
    setCurWallet: (state, action: PayloadAction<any>) => {
      state.curWallet = action.payload
    },
    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },
    setWallet: (state, action: PayloadAction<any>) => {
      state.wallet = action.payload
    },
    setWalletCategories: (state, action: PayloadAction<any>) => {
      state.walletCategories = action.payload
    },
  },
})

export const { setWallets, setCurWallet, setLoading, setWallet, setWalletCategories } = wallet.actions
export default wallet.reducer
