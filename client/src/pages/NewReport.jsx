import React, { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function NewReport() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [universities, setUniversities] = useState([])
  const [anonymous, setAnonymous] = useState(false)
  const [files, setFiles] = useState([]) // image files
  const [previews, setPreviews] = useState([]) // preview URLs
  const nav = useNavigate()

  // Load universities list
  useEffect(() => {
    (async () => {
      const u = await api('/api/universities')
      setUniversities(u || [])
      if (u && u[0]) setUniversityId(u[0]._id)
    })()
  }, [])

  // Generate previews when files change
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [files])

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5) // limit to 5 images
    setFiles(selected)
  }

  const submit = async (e) => {
    e.preventDefault()

    // If files are selected, use FormData; otherwise, send JSON
    let res
    if (files.length > 0) {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('body', body)
      fd.append('universityId', universityId)
      fd.append('anonymous', anonymous)
      files.forEach(f => fd.append('media', f)) // must match multer field
      res = await api('/api/reports', { method: 'POST', body: fd })
    } else {
      const payload = { title, body, universityId, anonymous }
      res = await api('/api/reports', { method: 'POST', body: payload })
    }

    if (res.report) {
      alert('Report submitted successfully!')
      nav('/')
    } else {
      alert(res.message || 'Something went wrong while submitting')
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2>Create a report</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />

        <textarea
          placeholder="Describe your experience"
          value={body}
          onChange={e => setBody(e.target.value)}
          style={{ display: 'block', width: '100%', height: 120, marginBottom: 10, padding: 8 }}
        />

        <select
          value={universityId}
          onChange={e => setUniversityId(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        >
          {universities.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>

        <label style={{ display: 'block', marginBottom: 10 }}>
          Upload images (max 5)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            style={{ display: 'block', marginTop: 4 }}
          />
        </label>

        {/* Image previews */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {previews.map((p, i) => (
            <div key={i} style={{ width: 120, height: 90, border: '1px solid #ddd', overflow: 'hidden' }}>
              <img
                src={p}
                alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        <label style={{ display: 'block', marginTop: 8 }}>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
          /> Post anonymously
        </label>

        <button type="submit" style={{ marginTop: 15, padding: '8px 16px' }}>
          Submit
        </button>
      </form>
    </div>
  )
}
