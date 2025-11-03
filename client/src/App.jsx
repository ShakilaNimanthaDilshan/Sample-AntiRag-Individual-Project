// client/src/App.jsx
import React, { useState, useMemo } from 'react'; // <-- Import useState & useMemo
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// --- MUI Imports ---
import { ThemeProvider } from '@mui/material/styles'; // <-- Import ThemeProvider
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import getTheme from './theme'; // <-- Import our new theme function
// --- End MUI Imports ---

// --- Page Imports ---
import Nav from './components/Nav';
import Feed from './pages/Feed';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DocumentedCases from './pages/DocumentedCases';
import HelpResources from './pages/HelpResources';
import TermsAndConditions from './pages/TermsAndConditions';
import NewReport from './pages/NewReport';
import EditReport from './pages/EditReport';
import ReportDetail from './pages/ReportDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ModerationQueue from './pages/ModerationQueue';
import CaseFileForm from './pages/CaseFileForm';
// --- End Page Imports ---

export default function App() {
  const { user } = useAuth();
  
  // --- 1. State for managing theme mode ---
  const [mode, setMode] = useState('light'); // 'light' or 'dark'

  // --- 2. Function to toggle the mode ---
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // --- 3. Create the theme based on the current mode ---
  // useMemo prevents remaking the theme on every single render
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    // --- 4. Provide the theme to the whole app ---
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Mui's reset */}
      <GlobalStyles styles={{ body: { backgroundColor: theme.palette.background.default } }} />
      
      {/* 5. Pass the toggle function to the Nav bar */}
      <Nav toggleTheme={toggleTheme} currentMode={mode} />
      
      <main>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/documented-cases" element={<DocumentedCases />} />
          <Route path="/help-resources" element={<HelpResources />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/new" element={user ? <NewReport /> : <Navigate to="/login" />} />
          <Route path="/edit/:id" element={user ? <EditReport /> : <Navigate to="/login" />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/moderation" element={user ? <ModerationQueue /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin/case-files/new" element={user && (user.role === 'admin' || user.role === 'moderator') ? <CaseFileForm /> : <Navigate to="/login" />} />
          <Route path="/admin/case-files/edit/:id" element={user && (user.role === 'admin' || user.role === 'moderator') ? <CaseFileForm /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </ThemeProvider>
  );
}