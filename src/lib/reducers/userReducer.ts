import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const user = createSlice({
  name: 'user',
  initialState: {
    token: null as string | null,
    user: null as IFullUser | null,
    loading: false as boolean,
    onboarding: null as any,
    stats: null as Stats | null,
  },
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setUser: (state, action: PayloadAction<IFullUser>) => {
      state.user = action.payload
    },
    setOnboarding: (state, action: PayloadAction<any>) => {
      state.onboarding = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    clearUser(state) {
      state.token = null
      state.user = null
    },
    setStats: (state, action: PayloadAction<Stats | null>) => {
      state.stats = action.payload
    },
  },
})

export const { setToken, setUser, setOnboarding, setLoading, clearUser, setStats } = user.actions
export default user.reducer
