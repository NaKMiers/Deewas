import { configureStore } from '@reduxjs/toolkit'
import modalReducer from './reducers/modalReducer'
import settingsReducer from './reducers/settingsReducer'
import walletReducer from './reducers/walletReducer'

export const makeStore = () => {
  return configureStore({
    reducer: {
      modal: modalReducer,
      wallet: walletReducer,
      settings: settingsReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
