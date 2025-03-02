import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const wallet = createSlice({
  name: 'wallet',
  initialState: {
    // for (home)
    curWallet: null as any,
    wallets: [] as any[],
    loading: false as boolean,
  },
  reducers: {
    setWallets: (state, action: PayloadAction<any>) => {
      state.wallets = action.payload
    },
    addWallet: (state, action: PayloadAction<any>) => {
      state.wallets = [action.payload, ...state.wallets]
    },
    updateWallet: (state, action: PayloadAction<any>) => {
      state.wallets = state.wallets.map((w: any) => (w._id === action.payload._id ? action.payload : w))
      if (state.curWallet?._id === action.payload._id) {
        state.curWallet = action.payload
      }
    },
    deleteWallet: (state, action: PayloadAction<any>) => {
      state.wallets = state.wallets.filter((w: any) => w._id !== action.payload._id)
    },
    setCurWallet: (state, action: PayloadAction<any>) => {
      state.curWallet = action.payload
    },
    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },
  },
})

export const { setWallets, setCurWallet, addWallet, updateWallet, deleteWallet, setLoading } =
  wallet.actions
export default wallet.reducer
