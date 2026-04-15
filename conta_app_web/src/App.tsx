import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Collect from './pages/Collect'
import Transcribe from './pages/Transcribe'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import WitnessForm from './collect_offline_first/form_witness/WitnessForm'
import AudioRecords from './collect_offline_first/upload_audio/AudioRecords'

// ─── Page Étape 1 : Formulaire témoin ─────────────────────────────────────────

function WitnessFormPage() {
  const navigate = useNavigate()

  return (
    <WitnessForm
      onNext={(data) => {
        console.log('Witness data:', data)
        navigate('/recuperation_audio_etap2', { state: { witnessData: data } })
      }}
    />
  )
}

// ─── Page Étape 2 : Enregistrement audio ──────────────────────────────────────

function AudioRecordPage() {
  const navigate = useNavigate()
  const location = window.history.state?.usr

  const witnessData = location?.witnessData ?? {
    name:           '',
    first_name:     '',
    age:            0,
    departement_id: '',
    region_id:      '',
  }

  return (
    <AudioRecords
      witnessData={witnessData}
      onSaved={() => {
        console.log('Audio saved')
        navigate('/recuperation_audio_etap1')
      }}
    />
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

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

      <Route path="/login"                    element={<Login />} />
      <Route path="/recuperation_audio_etap1" element={<WitnessFormPage />} />
      <Route path="/recuperation_audio_etap2" element={<AudioRecordPage />} />
    </Routes>
  )
}
