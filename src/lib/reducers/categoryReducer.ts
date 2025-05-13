import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const category = createSlice({
  name: 'category',
  initialState: {
    // for (home)
    categories: [] as any[],
    loading: false as boolean,
  },
  reducers: {
    setCategories: (state, action: PayloadAction<any>) => {
      state.categories = action.payload
    },
    addCategory: (state, action: PayloadAction<any>) => {
      state.categories = [action.payload, ...state.categories]
    },
    updateCategory: (state, action: PayloadAction<any>) => {
      state.categories = state.categories.map((w: any) =>
        w._id === action.payload._id ? action.payload : w
      )
    },
    deleteCategory: (state, action: PayloadAction<any>) => {
      state.categories = state.categories.filter((w: any) => w._id !== action.payload._id)
    },

    setLoading: (state, action: PayloadAction<any>) => {
      state.loading = action.payload
    },
  },
})

export const { setCategories, addCategory, updateCategory, deleteCategory, setLoading } =
  category.actions
export default category.reducer
