import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'


export default function Feed(){
const [reports, setReports] = useState([])
useEffect(()=>{ fetchReports() }, [])
const fetchReports = async ()=>{
const res = await api('/api/reports')
setReports(res || [])
}
return (
<div>
<h2>Recent Reports</h2>
<Link to="/new">Create report</Link>
<div>
{reports.length === 0 && <p>No reports yet</p>}
{reports.map(r => (
<article key={r._id} style={{ border: '1px solid #ddd', padding: 10, marginTop:10 }}>
<h3>{r.title || 'Experience'}</h3>
<small>{r.university?.name} • {new Date(r.createdAt).toLocaleString()}</small>
<p>{r.anonymous ? 'Posted anonymously' : r.author?.name}</p>
<p>{r.body}</p>
</article>
))}
</div>
</div>
)
}