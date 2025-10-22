import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'


const AuthContext = createContext()


export function AuthProvider({ children }){
const [user, setUser] = useState(null)
useEffect(()=>{
const raw = localStorage.getItem('user')
if (raw) setUser(JSON.parse(raw))
}, [])


const login = (token, userObj) => {
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(userObj))
setUser(userObj)
}
const logout = () => {
localStorage.removeItem('token')
localStorage.removeItem('user')
setUser(null)
}
return (
<AuthContext.Provider value={{ user, login, logout }}>
{children}
</AuthContext.Provider>
)
}
export const useAuth = () => useContext(AuthContext)