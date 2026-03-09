import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  console.log('Token in localStorage:', token ? 'YES (length: ' + token.length + ')' : 'NO')
  console.log('Request URL:', config.url)
  console.log('Full config URL:', config.baseURL + config.url)
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
    console.log('Authorization header set:', 'Bearer ' + token.substring(0, 20) + '...')
  } else {
    console.warn('NO TOKEN FOUND - Request will fail with 401')
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = 'Bearer ' + data.access
        return api(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api