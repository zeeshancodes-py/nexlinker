import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { addNotification } from '../store/notificationSlice'

export function useNotificationSocket() {
  const ws = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    ws.current = new WebSocket(`ws://localhost:8000/ws/notifications/`)
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data)
      dispatch(addNotification(data))
    }
    return () => ws.current?.close()
  }, [dispatch])

  return ws
}