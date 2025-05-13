import { configureStore } from '@reduxjs/toolkit'
import budgetReducer from './reducers/budgetReducer'
import categoryReducer from './reducers/categoryReducer'
import loadReducer from './reducers/loadReducer'
import screenReducer from './reducers/screenReducer'
import settingsReducer from './reducers/settingsReducer'
import transactionReducer from './reducers/transactionReducer'
import userReducer from './reducers/userReducer'
import walletReducer from './reducers/walletReducer'

export const makeStore = () => {
  return configureStore({
    reducer: {
      screen: screenReducer,
      load: loadReducer,
      settings: settingsReducer,
      wallet: walletReducer,
      category: categoryReducer,
      transaction: transactionReducer,
      budget: budgetReducer,
      user: userReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
