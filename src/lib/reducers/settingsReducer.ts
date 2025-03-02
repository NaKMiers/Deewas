import { ISettings } from '@/models/SettingsModel'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const settings = createSlice({
  name: 'settings',
  initialState: {
    settings: null as ISettings | null,
    loading: false as boolean,
    exchangeRates: { USD: 1 } as any,
  },
  reducers: {
    setSettings: (state, action: PayloadAction<any>) => {
      state.settings = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setExchangeRates: (state, action: PayloadAction<any>) => {
      state.exchangeRates = action.payload
    },
  },
})

export const { setSettings, setLoading, setExchangeRates } = settings.actions
export default settings.reducer
