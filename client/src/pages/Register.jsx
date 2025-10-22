import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'


export default function Register(){
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [university, setUniversity] = useState('')
const [error, setError] = useState('')
const nav = useNavigate()


const submit = async (e) =>{
e.preventDefault()
setError('')
try{
const res = await api('/api/auth/register', { method: 'POST', body: { name, email, password, university } })
if (res.message){
// go to login
nav('/login')
} else {
setError(res.message || 'Register failed')
}
}catch(err){ setError('Server error') }
}


return (
<div style={{ maxWidth: 480 }}>
<h2>Register</h2>
<form onSubmit={submit}>
<input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
<input placeholder="University (text)" value={university} onChange={e=>setUniversity(e.target.value)} />
<button type="submit">Register</button>
{error && <p style={{ color: 'red' }}>{error}</p>}
</form>
</div>
)
}