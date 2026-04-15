import { useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './AudioRecords.css'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AudioRecordData {
  url:        string
  duration:   string
  created_at: string
}

interface AudioRecordsProps {
  witnessData: {
    name:           string
    first_name:     string
    age:            number
    departement_id: string
    region_id:      string
  }
  onSaved: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function secondsToTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':')
}

function formatDisplayDuration(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  if (m === 0) return `${sec}s`
  return `${m}m ${sec}s`
}

function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

const ACCEPTED = 'audio/webm,audio/mpeg,audio/mp4,audio/wav,.webm,.mp3,.mp4,.wav'

function isValidFormat(file: File): boolean {
  const validTypes = ['audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav']
  const ext = file.name.split('.').pop()?.toLowerCase()
  return validTypes.includes(file.type) || ['webm', 'mp3', 'mp4', 'wav'].includes(ext ?? '')
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AudioRecords({ witnessData, onSaved }: AudioRecordsProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [file,       setFile]       = useState<File | null>(null)
  const [audioUrl,   setAudioUrl]   = useState<string | null>(null)
  const [duration,   setDuration]   = useState<number>(0)
  const [createdAt,  setCreatedAt]  = useState<string>('')
  const [dragging,   setDragging]   = useState(false)
  const [acceptRgpd, setAcceptRgpd] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [showToast,  setShowToast]  = useState(false)   // ← popup flottant

  // ── Process file ──────────────────────────────────────────────────────────

  async function processFile(f: File) {
    setError(null)
    setLoading(true)

    if (!isValidFormat(f)) {
      setError('Format non supporté. Utilisez webm, mp3, mp4 ou wav.')
      setLoading(false)
      return
    }

    const url = URL.createObjectURL(f)

    try {
      const dur = await new Promise<number>((resolve, reject) => {
        const audio = new Audio()
        audio.addEventListener('loadedmetadata', () => resolve(audio.duration))
        audio.addEventListener('error', () => reject())
        audio.src = url
      })

      setFile(f)
      setAudioUrl(url)
      setDuration(dur)
      setCreatedAt(new Date().toISOString())
    } catch {
      setError('Impossible de lire ce fichier audio.')
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }

  function handleRemove() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setFile(null)
    setAudioUrl(null)
    setDuration(0)
    setCreatedAt('')
    setAcceptRgpd(false)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  // ── Toast helper ──────────────────────────────────────────────────────────

  function showSuccessToast() {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      onSaved()
    }, 5000) // disparaît après 5 secondes puis redirige
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!file || !acceptRgpd) return
    setSaving(true)
    setError(null)

    try {
      // 1. Upload audio dans Supabase Storage
      const fileName = `${Date.now()}_${file.name}`
      const filePath = `audios/${fileName}`

      const { error: storageError } = await supabase.storage
        .from('collect_audio')
        .upload(filePath, file, { contentType: file.type, upsert: false })

      if (storageError) throw new Error(`Upload échoué : ${storageError.message}`)

      // 2. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('collect_audio')
        .getPublicUrl(filePath)

      // 3. Insérer dans collect_audio
      const { data: audioData, error: audioError } = await supabase
        .from('collect_audio')
        .insert({
          url:        publicUrl,
          duration:   secondsToTime(duration),
          created_at: createdAt,
        })
        .select('id')
        .single()

      if (audioError) throw new Error(`Erreur DB audio : ${audioError.message}`)

      // 4. Insérer dans collect_info_temoin
      const { error: witnessError } = await supabase
        .from('collect_info_temoin')
        .insert({
          name:           witnessData.name,
          first_name:     witnessData.first_name,
          age:            witnessData.age,
          accept_rgpd:    acceptRgpd,
          departement_id: witnessData.departement_id,
          region_id:      witnessData.region_id,
          audio_id:       audioData.id,
        })

      if (witnessError) throw new Error(`Erreur DB témoin : ${witnessError.message}`)

      // 5. Affiche le popup flottant 5 secondes puis redirige
      showSuccessToast()

    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="ar-wrapper">

      {/* ══ Toast flottant ══════════════════════════════════════════════════ */}
      {showToast && (
        <div className="ar-toast">
          <div className="ar-toast-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="ar-toast-content">
            <p className="ar-toast-title">Données transférées dans le cloud</p>
            <p className="ar-toast-sub">L'audio et les informations du témoin ont été sauvegardés.</p>
          </div>
          <div className="ar-toast-progress" />
        </div>
      )}

      <header className="ar-header">
        <span className="ar-step">Étape 2 sur 2</span>
        <h1>Enregistrement audio</h1>
        <p className="ar-subtitle">Importez le fichier audio du témoin.</p>
      </header>

      {/* ── Notice formats ── */}
      <div className="ar-notice">
        <span className="ar-notice-dot" />
        <p>
          Formats acceptés : <code>webm</code>, <code>mp3</code>, <code>mp4</code>, <code>wav</code>.
          Privilégiez <code>webm</code> pour la compatibilité Whisper.
        </p>
      </div>

      {/* ── Drop zone ── */}
      {!file ? (
        <div
          className={`ar-dropzone ${dragging ? 'ar-dropzone--over' : ''} ${loading ? 'ar-dropzone--loading' : ''}`}
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Zone d'import audio"
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleInput}
            style={{ display: 'none' }}
          />

          {loading ? (
            <div className="ar-loading">
              <span className="ar-spinner" />
              <span>Analyse du fichier…</span>
            </div>
          ) : (
            <>
              <div className="ar-drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v12M8 10l4 4 4-4M20 17v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2"/>
                </svg>
              </div>
              <p className="ar-drop-label">
                {dragging ? 'Déposez le fichier ici' : 'Glissez un fichier ou cliquez pour parcourir'}
              </p>
              <div className="ar-chips">
                {['WEBM', 'MP3', 'MP4', 'WAV'].map(f => (
                  <span key={f} className={`ar-chip ${f === 'WEBM' ? 'ar-chip--accent' : ''}`}>{f}</span>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="ar-card">
          <div className="ar-card-top">
            <div className="ar-file-info">
              <span className="ar-file-name">{file.name}</span>
              <span className="ar-file-size">{(file.size / (1024 * 1024)).toFixed(1)} Mo</span>
            </div>
            <button className="ar-remove" onClick={handleRemove} aria-label="Supprimer">✕</button>
          </div>

          <div className="ar-meta">
            <div className="ar-meta-item">
              <span className="ar-meta-label">Date de création</span>
              <span className="ar-meta-value">{formatDisplayDate(createdAt)}</span>
            </div>
            <div className="ar-meta-sep" />
            <div className="ar-meta-item">
              <span className="ar-meta-label">Durée</span>
              <span className="ar-meta-value">{formatDisplayDuration(duration)}</span>
            </div>
          </div>

          <audio className="ar-player" controls src={audioUrl ?? ''} />
        </div>
      )}

      {/* ── RGPD ── */}
      {file && (
        <label className={`ar-rgpd ${acceptRgpd ? 'ar-rgpd--checked' : ''}`}>
          <input
            type="checkbox"
            checked={acceptRgpd}
            onChange={e => setAcceptRgpd(e.target.checked)}
            className="ar-rgpd-input"
          />
          <span className="ar-rgpd-box" aria-hidden="true" />
          <span className="ar-rgpd-text">
            Le témoin accepte que ses données personnelles et son enregistrement audio
            soient collectés et traités conformément au{' '}
            <strong>Règlement Général sur la Protection des Données (RGPD)</strong>.
          </span>
        </label>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div className="ar-error" role="alert">
          <span>⚠</span> {error}
        </div>
      )}

      {/* ── Bouton enregistrer ── */}
      {file && (
        <button
          className="ar-btn-save"
          onClick={handleSave}
          disabled={!acceptRgpd || saving}
          aria-disabled={!acceptRgpd || saving}
        >
          {saving ? (
            <><span className="ar-spinner ar-spinner--dark" />Enregistrement…</>
          ) : (
            'Envoyer vers le cloud'
          )}
        </button>
      )}
    </div>
  )
}
