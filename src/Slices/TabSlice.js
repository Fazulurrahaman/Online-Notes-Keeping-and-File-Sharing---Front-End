import { createSlice } from '@reduxjs/toolkit'

export const tabSlice = createSlice({
  name: 'Tab',
  initialState: {
    value: '/share'
  },
  reducers: {
    changeTab: (state, action) => {
        console.log("state, action====>", state, action);
      state.value = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { changeTab } = tabSlice.actions

export default tabSlice.reducer;