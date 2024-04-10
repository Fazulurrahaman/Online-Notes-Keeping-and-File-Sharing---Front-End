import { createSlice } from '@reduxjs/toolkit'

export const LoaderSlice = createSlice({
    name: "loader",
    initialState:{
        isLoader: false
    },
    reducers:{
        loader:(state, action)=>{
            state.isLoader = action.payload
        }
    }
});

export const { loader } = LoaderSlice.actions

export default LoaderSlice.reducer;