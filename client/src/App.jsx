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
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile'; // Added from snippet 1
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ModerationQueue from './pages/ModerationQueue';
import TermsAndConditions from './pages/TermsAndConditions';
import HelpResources from './pages/HelpResources';

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
          <Route path="/edit/:id" element={user ? <EditReport /> : <Navigate to="/login" />} /> {/* Kept correct route */}
          <Route path="/report/:id" element={<ReportDetail />} /> 
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/moderation" element={user ? <ModerationQueue /> : <Navigate to="/login" />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/help-resources" element={<HelpResources />} />
        </Routes>
      </main>
    </div>
  );
}