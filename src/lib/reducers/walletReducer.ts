import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const wallet = createSlice({
  name: 'wallet',
  initialState: {
    // for (home)
    curWallet: null as any,
    wallets: [] as any[],
    loading: false as boolean,

    // for wallet page
    wallet: null as any,
    walletCategories: [] as any[],
  },
  reducers: {
    setWallets: (state, action: PayloadAction<any>) => {
      state.wallets = action.payload
    },
    updateWallet: (state, action: PayloadAction<any>) => {
      state.wallets = state.wallets.map((w: any) => (w._id === action.payload._id ? action.payload : w))
      if (state.curWallet?._id === action.payload._id) {
        state.curWallet = action.payload
      }
    },
    setCurWallet: (state, action: PayloadAction<any>) => {
      state.curWallet = action.payload
    },
    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },

    // for wallet page
    setWallet: (state, action: PayloadAction<any>) => {
      state.wallet = action.payload
    },
    setWalletCategories: (state, action: PayloadAction<any>) => {
      state.walletCategories = action.payload
    },
  },
})

export const { setWallets, setCurWallet, updateWallet, setLoading, setWallet, setWalletCategories } =
  wallet.actions
export default wallet.reducer
