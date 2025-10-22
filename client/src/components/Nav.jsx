import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'


export default function Nav(){
const { user, logout } = useAuth()
return (
<nav style={{ padding: 10, borderBottom: '1px solid #eee' }}>
<Link to="/">Home</Link>
{' | '}
{user ? (
<>
<span style={{ marginLeft: 8 }}>Hi, {user.name}</span>
{' | '}
<button onClick={logout}>Logout</button>
</>
) : (
<>
<Link to="/login">Login</Link>
{' | '}
<Link to="/register">Register</Link>
</>
)}
</nav>
)
}