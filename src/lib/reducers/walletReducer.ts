import { IWallet } from '@/models/WalletModel'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const wallet = createSlice({
  name: 'wallet',
  initialState: {
    // for (home)
    wallets: [] as any[],
    loading: false as boolean,
    defaultWallet: null as any,
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
    setDefaultWallet: (state, action: PayloadAction<IWallet | null>) => {
      state.defaultWallet = action.payload
    },
    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },
  },
})

export const { setWallets, addWallet, updateWallet, deleteWallet, setDefaultWallet, setLoading } =
  wallet.actions
export default wallet.reducer
