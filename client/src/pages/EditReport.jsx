import React, { useState, useEffect } from 'react'
import api from '../api'
import { useParams, useNavigate } from 'react-router-dom'

export default function EditReport(){
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    (async () => {
      const data = await api(`/api/reports/${id}`)
      if (data) {
        setTitle(data.title)
        setBody(data.body)
        setPreviews(data.media?.map(m => m.url) || [])
      }
    })()
  }, [id])

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const submit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', title)
    fd.append('body', body)
    files.forEach(f => fd.append('media', f))
    const res = await api(`/api/reports/${id}`, { method: 'PUT', body: fd })
    if (res.message === 'Report updated successfully') {
      alert('Updated!')
      nav('/')
    } else {
      alert(res.message || 'Update failed')
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Edit Report</h2>
      <form onSubmit={submit}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Body" />
        <input type="file" multiple accept="image/*" onChange={onFileChange} />

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {previews.map((p,i)=>(
            <img key={i} src={p} alt="preview" style={{ width:120, height:90, objectFit:'cover' }}/>
          ))}
        </div>

        <button type="submit" style={{ marginTop: 10 }}>Save</button>
      </form>
    </div>
  )
}
