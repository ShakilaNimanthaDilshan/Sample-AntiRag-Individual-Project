import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ padding: 10, borderBottom: '1px solid #eee' }}>
      <Link to="/">Feed</Link>
      {' | '}
      {user ? (
        <>
          <Link to="/new">New Report</Link>
          {' | '}

          {/* --- ADD THIS LINE --- */}
          {user.role === 'admin' && (
            <>
              <Link to="/admin" style={{ color: 'red' }}>Admin</Link>
              {' | '}
            </>
          )}
          
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
  );
}