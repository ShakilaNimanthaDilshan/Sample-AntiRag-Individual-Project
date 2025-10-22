import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import NewReport from './pages/NewReport'
import Nav from './components/Nav'
import { useAuth } from './contexts/AuthContext'


export default function App(){
const { user } = useAuth()
return (
<div>
<Nav />
<main style={{ padding: 20 }}>
<Routes>
<Route path="/" element={<Feed/>} />
<Route path="/login" element={user ? <Navigate to='/' /> : <Login/>} />
<Route path="/register" element={user ? <Navigate to='/' /> : <Register/>} />
<Route path="/new" element={user ? <NewReport/> : <Navigate to='/login' />} />
</Routes>
</main>
</div>
)
}