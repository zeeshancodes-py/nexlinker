import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const fetchPosts = createAsyncThunk('feed/fetchPosts', async (page = 1) => {
  const { data } = await api.get(`/feed/?page=${page}`)
  return { ...data, page }
})

export const createPost = createAsyncThunk('feed/createPost', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/feed/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data)
  }
})

export const reactToPost = createAsyncThunk('feed/reactToPost', async ({ postId, reactionType }) => {
  const { data } = await api.post(`/feed/${postId}/react/`, { reaction_type: reactionType })
  return { postId, ...data }
})

export const deletePost = createAsyncThunk('feed/deletePost', async (postId) => {
  await api.delete(`/feed/${postId}/`)
  return postId
})

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: [],
    loading: false,
    hasMore: true,
    error: null,
  },
  reducers: {
    addComment: (state, action) => {
      const post = state.posts.find(p => p.id === action.payload.postId)
      if (post) post.comments_count += 1
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, state => { state.loading = true })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.page === 1) {
          state.posts = action.payload.results
        } else {
          state.posts = [...state.posts, ...action.payload.results]
        }
        state.hasMore = !!action.payload.next
      })
      .addCase(fetchPosts.rejected, state => { state.loading = false })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts = [action.payload, ...state.posts]
      })
      .addCase(reactToPost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId)
        if (post) {
          post.is_liked = action.payload.liked
          post.user_reaction = action.payload.liked ? action.payload.reaction_type : null
          if (action.payload.liked) post.likes_count += 1
          else post.likes_count = Math.max(0, post.likes_count - 1)
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload)
      })
  },
})

export const { addComment } = feedSlice.actions
export default feedSlice.reducer