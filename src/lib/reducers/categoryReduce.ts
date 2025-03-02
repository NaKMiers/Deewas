import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const category = createSlice({
  name: 'category',
  initialState: {
    categories: [] as any[],
    loading: false as boolean,
  },
  reducers: {
    setCategories: (state, action: PayloadAction<any>) => {
      state.categories = action.payload
    },
    addCategory: (state, action: PayloadAction<any>) => {
      state.categories.push(action.payload)
    },
    updateCategory: (state, action: PayloadAction<any>) => {
      state.categories = state.categories.map(category =>
        category._id === action.payload._id ? action.payload : category
      )
    },
    deleteCategory: (state, action: PayloadAction<any>) => {
      state.categories = state.categories.filter(category => category._id !== action.payload._id)
    },
    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },
  },
})

export const { setCategories, addCategory, updateCategory, deleteCategory, setLoading } =
  category.actions
export default category.reducer
