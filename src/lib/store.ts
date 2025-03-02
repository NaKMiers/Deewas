import { configureStore } from '@reduxjs/toolkit'
import budgetReducer from './reducers/budgetReducer'
import categoryReduce from './reducers/categoryReduce'
import loadReducer from './reducers/loadReducer'
import settingsReducer from './reducers/settingsReducer'
import transactionReducer from './reducers/transactionReducer'
import walletReducer from './reducers/walletReducer'

export const makeStore = () => {
  return configureStore({
    reducer: {
      load: loadReducer,
      settings: settingsReducer,
      wallet: walletReducer,
      category: categoryReduce,
      transaction: transactionReducer,
      budget: budgetReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
