import React, { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function NewReport() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [universityId, setUniversityId] = useState('') // Default to empty string
  const [universities, setUniversities] = useState([])
  const [otherUniversityName, setOtherUniversityName] = useState(''); // <-- ADDED
  const [anonymous, setAnonymous] = useState(false)
  const [files, setFiles] = useState([]) // image files
  const [previews, setPreviews] = useState([]) // preview URLs
  const [isPublic, setIsPublic] = useState(true);
  const nav = useNavigate()

  // Load universities list
  useEffect(() => {
    (async () => {
      try {
        const u = await api('/api/universities')
        if (u && Array.isArray(u)) {
          // Filter out pending universities, only show approved ones
          const approvedUniversities = u.filter(uni => uni.status !== 'pending'); // <-- MODIFIED
          setUniversities(approvedUniversities || []);
        }
      } catch (err) {
        console.error("Failed to fetch universities", err);
      }
    })()
  }, []) // Runs once on load

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

    // --- ADDED VALIDATION ---
    if (!universityId) return alert('Please select a university.');
    if (universityId === 'OTHER' && !otherUniversityName.trim()) {
      return alert('Please enter the name of the university.');
    }
    // --- END VALIDATION ---

    let res
    if (files.length > 0) {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('body', body)
      fd.append('anonymous', anonymous)
      fd.append('isPublic', isPublic)
      files.forEach(f => fd.append('media', f))

      // --- MODIFIED LOGIC ---
      fd.append('universityId', universityId)
      if (universityId === 'OTHER') {
        fd.append('otherUniversityName', otherUniversityName)
      }
      // --- END MODIFIED LOGIC ---

      res = await api('/api/reports', { method: 'POST', body: fd })
    } else {
      // --- MODIFIED LOGIC ---
      const payload = { 
        title, 
        body, 
        universityId, 
        anonymous,
        isPublic
      }
      if (universityId === 'OTHER') {
        payload.otherUniversityName = otherUniversityName;
      }
      // --- END MODIFIED LOGIC ---

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
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h2>Create a report</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8, boxSizing: 'border-box' }}
        />

        <textarea
          placeholder="Describe your experience *"
          value={body}
          onChange={e => setBody(e.target.value)}
          required
          style={{ display: 'block', width: '100%', height: 120, marginBottom: 10, padding: 8, boxSizing: 'border-box' }}
        />

        {/* --- MODIFIED SELECT --- */}
        <label htmlFor="university-select" style={{ display: 'block', marginBottom: '5px' }}>Select your university *</label>
        <select
          id="university-select"
          value={universityId}
          onChange={e => setUniversityId(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8, boxSizing: 'border-box' }}
        >
          <option value="" disabled>-- Select a University --</option>
          {universities.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
          <option value="OTHER">Other (Please specify)</option> {/* <-- ADDED */}
        </select>
        {/* --- END MODIFIED SELECT --- */}

        {/* --- ADDED CONDITIONAL INPUT --- */}
        {universityId === 'OTHER' && (
          <input
            type="text"
            placeholder="Please enter university name *"
            value={otherUniversityName}
            onChange={e => setOtherUniversityName(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8, boxSizing: 'border-box' }}
          />
        )}
        {/* --- END ADDED INPUT --- */}


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

        {/* --- REPLACED CHECKBOXES --- */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
          <input 
            type="checkbox" 
            checked={isPublic} 
            onChange={e => setIsPublic(e.target.checked)} 
          />
          Make this report visible on the public feed
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
          <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} /> 
          Post anonymously
        </label>
        {/* --- END OF REPLACEMENT --- */}

        <button
          type="submit"
          style={{
            marginTop: 15,
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Submit
        </button>
      </form>
    </div>
  )
}