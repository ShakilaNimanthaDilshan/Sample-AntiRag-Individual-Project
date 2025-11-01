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

      // --- THIS IS THE FIX ---

      // 1. Check for the specific SUCCESS message
      if (res.message === 'User registered successfully'){
        alert('Registration successful! Please log in.');
        nav('/login');
        return; // Exit the function on success
      }
      
      // 2. If it's not a success, it's an error. Find the error message.
      let errorMsg = 'Registration failed. Please try again.';
      if (res.errors && Array.isArray(res.errors) && res.errors.length > 0) {
        // This catches validation errors (e.g., "Valid email required")
        errorMsg = res.errors[0].msg; 
      } else if (res.message) {
        // This catches other errors (e.g., "Email already exists")
        errorMsg = res.message;
      }
      setError(errorMsg);
      // --- END OF FIX ---

    }catch(err){ 
      // This will only catch network errors (like server is down)
      setError(err.message || 'A network error occurred.'); 
    }
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