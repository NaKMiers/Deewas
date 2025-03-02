import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const load = createSlice({
  name: 'load',
  initialState: {
    isPageLoading: false,
    isLoading: false,
    refetching: new Date().getTime(),
  },
  reducers: {
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.isPageLoading = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    refetching: state => {
      state.refetching = new Date().getTime()
    },
  },
})

export const { setPageLoading, setLoading, refetching } = load.actions
export default load.reducer
