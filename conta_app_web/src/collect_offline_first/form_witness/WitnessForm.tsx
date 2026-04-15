import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './WitnessForm.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Departement {
  id:               string
  name_departement: string
}

interface RegionCorse {
  id:          string
  name_region: string
}

export interface WitnessFormData {
  name:           string
  first_name:     string
  age:            number | ''
  departement_id: string
  region_id:      string
}

interface WitnessFormProps {
  onNext: (data: WitnessFormData) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WitnessForm({ onNext }: WitnessFormProps) {
  const [form, setForm] = useState<WitnessFormData>({
    name:           '',
    first_name:     '',
    age:            '',
    departement_id: '',
    region_id:      '',
  })

  const [departements,  setDepartements]  = useState<Departement[]>([])
  const [regionsCorse,  setRegionsCorse]  = useState<RegionCorse[]>([])
  const [loadingDepts,  setLoadingDepts]  = useState(true)
  const [loadingRegions, setLoadingRegions] = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  // ── Fetch départements depuis Supabase ────────────────────────────────────

  useEffect(() => {
    async function fetchDepartements() {
      setLoadingDepts(true)
      const { data, error } = await supabase
        .from('departements')
        .select('id, name_departement')
        .order('name_departement', { ascending: true })

      if (!error && data) setDepartements(data)
      setLoadingDepts(false)
    }
    fetchDepartements()
  }, [])

  // ── Fetch régions_corse depuis Supabase ───────────────────────────────────

  useEffect(() => {
    async function fetchRegions() {
      setLoadingRegions(true)
      const { data, error } = await supabase
        .from('regions_corse')
        .select('id, name_region')
        .order('name_region', { ascending: true })

      if (!error && data) setRegionsCorse(data)
      setLoadingRegions(false)
    }
    fetchRegions()
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────

  const isValid =
    form.name.trim()       !== '' &&
    form.first_name.trim() !== '' &&
    form.age               !== '' &&
    Number(form.age)       >  0  &&
    form.departement_id    !== '' &&
    form.region_id         !== ''

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'age' ? (value === '' ? '' : Number(value)) : value,
    }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSaving(true)
    setError(null)
    try {
      onNext(form as WitnessFormData)
    } catch (err: any) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="wf-wrapper">
      <header className="wf-header">
        <span className="wf-step">Étape 1 sur 3</span>
        <h1>Informations du témoin</h1>
        <p className="wf-subtitle">
          Renseignez les informations du locuteur avant l'enregistrement.
        </p>
      </header>

      <form
        className="wf-form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Formulaire d'identification du témoin"
      >
        {/* Nom & Prénom */}
        <div className="wf-row">
          <div className="wf-field">
            <label htmlFor="name">
              Nom <span className="wf-required" aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="ex. Ferracci"
              autoComplete="family-name"
              required
              aria-required="true"
              tabIndex={1}
            />
          </div>

          <div className="wf-field">
            <label htmlFor="first_name">
              Prénom <span className="wf-required" aria-hidden="true">*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
              placeholder="ex. Maria"
              autoComplete="given-name"
              required
              aria-required="true"
              tabIndex={2}
            />
          </div>
        </div>

        {/* Âge */}
        <div className="wf-field wf-field--short">
          <label htmlFor="age">
            Âge <span className="wf-required" aria-hidden="true">*</span>
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={1}
            max={120}
            value={form.age}
            onChange={handleChange}
            placeholder="ex. 78"
            required
            aria-required="true"
            tabIndex={3}
          />
        </div>

        {/* Département */}
        <div className="wf-field">
          <label htmlFor="departement_id">
            Département <span className="wf-required" aria-hidden="true">*</span>
          </label>
          <div className="wf-select-wrap">
            {loadingDepts ? (
              <div className="wf-select-loading">
                <span className="wf-spinner" />
                Chargement…
              </div>
            ) : (
              <>
                <select
                  id="departement_id"
                  name="departement_id"
                  value={form.departement_id}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  tabIndex={4}
                >
                  <option value="">— Sélectionner un département —</option>
                  {departements.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name_departement}
                    </option>
                  ))}
                </select>
                <span className="wf-arrow" aria-hidden="true">▾</span>
              </>
            )}
          </div>
        </div>

        {/* Région Corse */}
        <div className="wf-field">
          <label htmlFor="region_id">
            Région <span className="wf-required" aria-hidden="true">*</span>
          </label>
          <div className="wf-select-wrap">
            {loadingRegions ? (
              <div className="wf-select-loading">
                <span className="wf-spinner" />
                Chargement…
              </div>
            ) : (
              <>
                <select
                  id="region_id"
                  name="region_id"
                  value={form.region_id}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  tabIndex={5}
                >
                  <option value="">— Sélectionner une région —</option>
                  {regionsCorse.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.name_region}
                    </option>
                  ))}
                </select>
                <span className="wf-arrow" aria-hidden="true">▾</span>
              </>
            )}
          </div>
        </div>

        <p className="wf-required-note">
          <span className="wf-required" aria-hidden="true">*</span> Champs obligatoires
        </p>

        {error && (
          <p className="wf-error" role="alert" aria-live="assertive">
            ⚠ {error}
          </p>
        )}

        <button
          type="submit"
          tabIndex={6}
          disabled={!isValid || saving}
          aria-disabled={!isValid || saving}
          className="wf-btn-next"
        >
          {saving ? 'Enregistrement…' : 'Suivant →'}
        </button>
      </form>
    </div>
  )
}
