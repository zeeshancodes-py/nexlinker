import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login/', credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data || { detail: 'Login failed.' })
  }
})

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register/', userData)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data || { detail: 'Registration failed.' })
  }
})

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('access_token')
  if (!token) return rejectWithValue('No token')
  try {
    const { data } = await api.get('/auth/me/')
    return data
  } catch {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return rejectWithValue('Invalid token')
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  const refresh = localStorage.getItem('refresh_token')
  try { await api.post('/auth/logout/', { refresh }) } catch {}
  localStorage.clear()
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    clearError: state => { state.error = null },
    updateUser: (state, action) => { state.user = { ...state.user, ...action.payload } },
  },
  extraReducers: builder => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
        state.loading = false
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
        state.loading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload
        state.loading = false
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(checkAuth.rejected, state => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
      })
      .addCase(logout.fulfilled, state => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
      })
  },
})

export const { clearError, updateUser } = authSlice.actions
export default authSlice.reducer