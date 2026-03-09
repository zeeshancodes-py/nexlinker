import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await api.get('/notifications/')
  return data
})

export const fetchUnreadCount = createAsyncThunk('notifications/unreadCount', async () => {
  const { data } = await api.get('/notifications/unread-count/')
  return data.unread_count
})

export const markAllRead = createAsyncThunk('notifications/markAll', async () => {
  await api.post('/notifications/mark-all-read/')
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items = [action.payload, ...state.items]
      state.unreadCount += 1
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.results || action.payload
        state.loading = false
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      .addCase(markAllRead.fulfilled, state => {
        state.items = state.items.map(n => ({ ...n, is_read: true }))
        state.unreadCount = 0
      })
  },
})

export const { addNotification } = notificationSlice.actions
export default notificationSlice.reducer