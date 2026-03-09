import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axios'

export const fetchConversations = createAsyncThunk('messages/fetchConversations', async () => {
  console.log('Fetching conversations...')
  const { data } = await api.get('/messages/conversations/')
  console.log('Conversations response:', data)
  return data
})

export const fetchMessages = createAsyncThunk('messages/fetchMessages', async (conversationId) => {
  console.log('Fetching messages for conversation:', conversationId)
  const { data } = await api.get(`/messages/conversations/${conversationId}/messages/`)
  console.log('Messages response:', data)
  return { conversationId, messages: data.results || data }
})

export const sendMessage = createAsyncThunk('messages/send', async ({ conversationId, content }) => {
  console.log('Sending message to conversation:', conversationId)
  const { data } = await api.post(`/messages/conversations/${conversationId}/send/`, { content })
  console.log('Send message response:', data)
  return { conversationId, message: data }
})

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: {},
    loading: false,
  },
  reducers: {
    setActiveConversation: (state, action) => { state.activeConversation = action.payload },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload
      if (!state.messages[conversationId]) state.messages[conversationId] = []
      state.messages[conversationId].push(message)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.results || action.payload
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.conversationId] = action.payload.messages
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload
        if (!state.messages[conversationId]) state.messages[conversationId] = []
        state.messages[conversationId].push(message)
      })
  },
  selectors: {
    selectUnreadMessageCount: (state) => 
      state.conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
  }
})

export const { setActiveConversation, addMessage } = messageSlice.actions
export const { selectUnreadMessageCount } = messageSlice.selectors
export default messageSlice.reducer