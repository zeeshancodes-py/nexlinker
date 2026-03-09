import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import feedReducer from './feedSlice'
import profileReducer from './profileSlice'
import notificationReducer from './notificationSlice'
import messageReducer from './messageSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    profile: profileReducer,
    notifications: notificationReducer,
    messages: messageReducer,
  },
})