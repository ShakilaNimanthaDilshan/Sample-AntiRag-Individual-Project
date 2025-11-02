import React, { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext' // <-- 1. IMPORT AUTOCONTEXT

export default function NewReport() {
  const { user } = useAuth() // <-- 2. GET THE LOGGED-IN USER
  const nav = useNavigate()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  
  // 3. SET UNIVERSITY ID BASED ON USER TYPE
  const [universityId, setUniversityId] = useState(user?.isStudent ? user.university : '')

  const [universities, setUniversities] = useState([]) // For the dropdown
  const [otherUniversityName, setOtherUniversityName] = useState('');
  const [anonymous, setAnonymous] = useState(false)
  const [isPublic, setIsPublic] = useState(true);
  
  const [files, setFiles] = useState([]) // image files
  const [previews, setPreviews] = useState([]) // preview URLs

  // Load universities list
  useEffect(() => {
    (async () => {
      try {
        const u = await api('/api/universities')
        if (u && Array.isArray(u)) {
          // Filter out pending universities, only show approved ones
          const approvedUniversities = u.filter(uni => uni.status !== 'pending');
          setUniversities(approvedUniversities || []);
          // 4. REMOVED CONFLICTING LINE: The line that setUniversityId(u[0]._id) was here.
          // It's removed so the user's default university is kept.
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

    if (!universityId) return alert('Please select a university.');
    if (universityId === 'OTHER' && !otherUniversityName.trim()) {
      return alert('Please enter the name of the university.');
    }

    let res
    if (files.length > 0) {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('body', body)
      fd.append('anonymous', anonymous)
      fd.append('isPublic', isPublic)
      files.forEach(f => fd.append('media', f))
      fd.append('universityId', universityId)
      if (universityId === 'OTHER') {
        fd.append('otherUniversityName', otherUniversityName)
      }
      res = await api('/api/reports', { method: 'POST', body: fd })
    } else {
      // --- 5. FIXED PAYLOAD (was missing fields) ---
      const payload = { 
        title, 
        body, 
        universityId, 
        anonymous, 
        isPublic, // <-- Added
        otherUniversityName: universityId === 'OTHER' ? otherUniversityName : '' // <-- Added
      }
      res = await api('/api/reports', { method: 'POST', body: payload })
    }

    if (res.report) {
      alert('Report submitted successfully!')
      nav('/')
    } else {
      alert(res.message || 'Something went wrong while submitting')
    }
  }

  // Helper to find the student's university name from the list
  const getStudentUniversityName = () => {
    if (!user || !user.isStudent) return '';
    const uni = universities.find(u => u._id === user.university);
    return uni ? uni.name : '(Your University)';
  };

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

        {/* --- 6. CONDITIONAL UNIVERSITY FIELDS --- */}
        {!user ? (
          <p>Loading user info...</p>
        ) : user.isStudent ? (
          // --- IF USER IS A STUDENT ---
          <div>
            <label>University (Locked to your profile)</label>
            <input
              type="text"
              value={getStudentUniversityName()}
              disabled
              style={{ width: '100%', padding: 8, background: '#eee', boxSizing: 'border-box' }}
            />
          </div>
        ) : (
          // --- IF USER IS A NON-STUDENT (Show dropdown) ---
          <>
            <label htmlFor="university-select" style={{ display: 'block', marginBottom: '5px' }}>Which university is this report about? *</label>
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
              <option value="OTHER">Other (Please specify)</option>
            </select>

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
          </>
        )}
        {/* --- END OF CONDITIONAL FIELDS --- */}


        <label style={{ display: 'block', marginBottom: 10, marginTop: 10 }}>
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
          <input 
            type="checkbox" 
            checked={isPublic} 
            onChange={e => setIsPublic(e.target.checked)} 
          />
          Make this report visible on the public feed
        </label>

        {/* ✅ Fixed: Checkbox and label aligned */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: 10,
            marginBottom: 10
          }}
        >
          <input
            type="checkbox"
            id="anonymous"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
          <label
            htmlFor="anonymous"
            style={{ fontSize: '15px', cursor: 'pointer', userSelect: 'none' }}
          >
            Post anonymously
          </label>
        </div>

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