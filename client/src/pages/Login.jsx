import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'


export default function Login(){
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')
const { login } = useAuth()
const nav = useNavigate()


const submit = async (e) =>{
e.preventDefault()
setError('')
try{
const res = await api('/api/auth/login', { method: 'POST', body: { email, password } })
if (res.token){
login(res.token, res.user)
nav('/')
} else {
setError(res.message || 'Login failed')
}
}catch(err){ setError('Server error') }
}


return (
<div style={{ maxWidth: 480 }}>
<h2>Login</h2>
<form onSubmit={submit}>
<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
<button type="submit">Login</button>
{error && <p style={{ color: 'red' }}>{error}</p>}
</form>
</div>
)
}