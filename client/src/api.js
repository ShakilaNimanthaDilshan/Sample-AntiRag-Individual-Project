const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'


export async function api(path, { method = 'GET', body, token, headers = {} } = {}){
const opts = { method, headers: { ...headers } }
if (body && !(body instanceof FormData)){
opts.headers['Content-Type'] = 'application/json'
opts.body = JSON.stringify(body)
} else if (body instanceof FormData){
opts.body = body
}
const storedToken = token || localStorage.getItem('token')
if (storedToken) opts.headers['Authorization'] = 'Bearer ' + storedToken


const res = await fetch(API_BASE + path, opts)
const text = await res.text()
try { return JSON.parse(text) } catch { return text }
}


export default api