import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const fetchMyProfile = createAsyncThunk('profile/fetchMine', async () => {
  const { data } = await api.get('/profiles/me/')
  return data
})

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (userId) => {
  const { data } = await api.get(`/profiles/${userId}/`)
  return data
})

export const updateProfile = createAsyncThunk('profile/update', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.patch('/profiles/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    myProfile: null,
    viewedProfile: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMyProfile.fulfilled, (state, action) => { state.myProfile = action.payload })
      .addCase(fetchProfile.pending, state => { state.loading = true })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.viewedProfile = action.payload
        state.loading = false
      })
      .addCase(fetchProfile.rejected, state => { state.loading = false })
      .addCase(updateProfile.fulfilled, (state, action) => { state.myProfile = action.payload })
  },
})

export default profileSlice.reducer