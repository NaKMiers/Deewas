import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const budget = createSlice({
  name: 'budget',
  initialState: {
    budgets: [] as any[],
    loading: false as boolean,
  },
  reducers: {
    setBudgets: (state, action: PayloadAction<any>) => {
      state.budgets = action.payload
    },
    addBudget: (state, action: PayloadAction<any>) => {
      state.budgets = [action.payload, ...state.budgets]
    },
    updateBudget: (state, action: PayloadAction<any>) => {
      state.budgets = state.budgets.map(budget =>
        budget._id === action.payload._id ? action.payload : budget
      )
    },
    deleteBudget: (state, action: PayloadAction<any>) => {
      state.budgets = state.budgets.filter(budget => budget._id !== action.payload._id)
    },
    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },
  },
})

export const { setBudgets, addBudget, updateBudget, deleteBudget, setLoading } = budget.actions
export default budget.reducer
