import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import NewReport from './pages/NewReport';
import Nav from './components/Nav';
import { useAuth } from './contexts/AuthContext';
import EditReport from './pages/EditReport';
import ReportDetail from './pages/ReportDetail';
import AdminDashboard from './pages/AdminDashboard'; // Added from snippet 1

export default function App() {
  const { user } = useAuth();
  return (
    <div>
      <Nav />
      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={user ? <Navigate to='/' /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to='/' /> : <Register />} />
          <Route path="/new" element={user ? <NewReport /> : <Navigate to='/login' />} />
          <Route path="/edit/:id" element={<EditReport />} />
          <Route path="/report/:id" element={<ReportDetail />} /> 
          
          {/* --- ADD THIS ROUTE --- */}
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
        </Routes>
      </main>
    </div>
  );
}