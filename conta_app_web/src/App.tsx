import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Collect from './pages/Collect'
import Transcribe from './pages/Transcribe'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/collect"
        element={
          <ProtectedRoute>
            <Collect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transcribe"
        element={
          <ProtectedRoute>
            <Transcribe />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />

    </Routes>

    
  )
}