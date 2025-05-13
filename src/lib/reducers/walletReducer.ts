import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const wallet = createSlice({
  name: 'wallet',
  initialState: {
    // for (home)
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
    },
    deleteWallet: (state, action: PayloadAction<any>) => {
      state.wallets = state.wallets.filter((w: any) => w._id !== action.payload._id)
    },
    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },
  },
})

export const { setWallets, addWallet, updateWallet, deleteWallet, setLoading } = wallet.actions
export default wallet.reducer
