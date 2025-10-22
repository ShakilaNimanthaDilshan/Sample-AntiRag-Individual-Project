import React, { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'


export default function NewReport(){
const [title, setTitle] = useState('')
const [body, setBody] = useState('')
const [universityId, setUniversityId] = useState('')
const [universities, setUniversities] = useState([])
const [anonymous, setAnonymous] = useState(false)
const nav = useNavigate()


useEffect(()=>{ (async ()=>{
const u = await api('/api/universities')
setUniversities(u || [])
if (u && u[0]) setUniversityId(u[0]._id)
})() }, [])


const submit = async (e) =>{
e.preventDefault()
const payload = { title, body, universityId, anonymous }
const res = await api('/api/reports', { method: 'POST', body: payload })
if (res.report) nav('/')
}


return (
<div style={{ maxWidth: 700 }}>
<h2>Create a report</h2>
<form onSubmit={submit}>
<input placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
<textarea placeholder="Describe your experience" value={body} onChange={e=>setBody(e.target.value)} />
<select value={universityId} onChange={e=>setUniversityId(e.target.value)}>
{universities.map(u=> <option key={u._id} value={u._id}>{u.name}</option>)}
</select>
<label><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} /> Post anonymously</label>
<button type="submit">Submit</button>
</form>
</div>
)
}