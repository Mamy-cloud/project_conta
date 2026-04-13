
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Collect from './pages/Collect'
import Transcribe from './pages/Transcribe'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import WitnessForm from './collect_offline_first/WitnessForm'

function WitnessFormPage() {
  const navigate = useNavigate()
  return (
    <WitnessForm onNext={(data) => {
      console.log(data)
      navigate('/recuperation_audio_etap1')
    }} />
  )
}

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
      <Route path="/recuperation_audio_etap1" element={<WitnessFormPage />} />
    </Routes>
  )
}