import { configureStore } from '@reduxjs/toolkit'
import tabReducer from './Slices/TabSlice'
import MessageSlice from './Slices/MessageSlice'
import LoaderSlice from './Slices/LoaderSlice'

export default configureStore({
  reducer: {
    tab: tabReducer,
    messages: MessageSlice,
    loader: LoaderSlice
  }
})