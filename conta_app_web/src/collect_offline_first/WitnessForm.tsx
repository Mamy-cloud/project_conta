import { useState } from 'react'
import type { Enums } from '../lib/database.types'
import './WitnessForm.css'

type AgeRange = Enums<'age_range'>
type LanguageRatio = Enums<'language_ratio'>

export interface WitnessFormData {
  firstName: string
  lastName: string
  ageRange: AgeRange | ''
  village: string
  languageRatio: LanguageRatio | ''
}

interface WitnessFormProps {
  onNext: (data: WitnessFormData) => void
}

const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '70-80': '70 – 80 ans',
  '80-90': '80 – 90 ans',
  '90+': '90 ans et plus',
}

const LANGUAGE_RATIO_LABELS: Record<LanguageRatio, string> = {
  mostly_corsican: 'Majoritairement corse',
  mixed: 'Mixte (corse / français)',
  mostly_french: 'Majoritairement français',
}

const AGE_RANGES: AgeRange[] = ['70-80', '80-90', '90+']
const LANGUAGE_RATIOS: LanguageRatio[] = ['mostly_corsican', 'mixed', 'mostly_french']

export default function WitnessForm({ onNext }: WitnessFormProps) {
  const [form, setForm] = useState<WitnessFormData>({
    firstName: '',
    lastName: '',
    ageRange: '',
    village: '',
    languageRatio: '',
  })

  const isValid =
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.village.trim() !== ''

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isValid) onNext(form)
  }

  return (
    <div className="witness-form-wrapper">
      <header className="form-header">
        <span className="step-label">Étape 1 sur 3</span>
        <h1>Témoin</h1>
        <p className="subtitle">
          Renseignez les informations du locuteur avant l'enregistrement.
        </p>
      </header>

      <form
        className="witness-form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Formulaire d'identification du témoin"
      >
        {/* Nom & Prénom */}
        <div className="field-row">
          <div className="field">
            <label htmlFor="firstName">
              Prénom <span aria-hidden="true" className="required">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              placeholder="ex. Maria"
              autoComplete="given-name"
              required
              aria-required="true"
              tabIndex={1}
            />
          </div>

          <div className="field">
            <label htmlFor="lastName">
              Nom <span aria-hidden="true" className="required">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              placeholder="ex. Ferracci"
              autoComplete="family-name"
              required
              aria-required="true"
              tabIndex={2}
            />
          </div>
        </div>

        {/* Village */}
        <div className="field">
          <label htmlFor="village">
            Village / Commune <span aria-hidden="true" className="required">*</span>
          </label>
          <input
            id="village"
            name="village"
            type="text"
            value={form.village}
            onChange={handleChange}
            placeholder="ex. Calenzana"
            autoComplete="address-level2"
            required
            aria-required="true"
            tabIndex={3}
          />
        </div>

        {/* Tranche d'âge */}
        <div className="field">
          <label htmlFor="ageRange">
            Tranche d'âge{' '}
            <span className="optional">(facultatif)</span>
          </label>
          <div className="select-wrapper">
            <select
              id="ageRange"
              name="ageRange"
              value={form.ageRange}
              onChange={handleChange}
              tabIndex={4}
              aria-label="Sélectionnez une tranche d'âge"
            >
              <option value="">— Non renseigné —</option>
              {AGE_RANGES.map((range) => (
                <option key={range} value={range}>
                  {AGE_RANGE_LABELS[range]}
                </option>
              ))}
            </select>
            <span className="select-arrow" aria-hidden="true">▾</span>
          </div>
        </div>

        {/* Ratio linguistique */}
        <div className="field">
          <label htmlFor="languageRatio">
            Ratio linguistique{' '}
            <span className="optional">(facultatif)</span>
          </label>
          <div className="select-wrapper">
            <select
              id="languageRatio"
              name="languageRatio"
              value={form.languageRatio}
              onChange={handleChange}
              tabIndex={5}
              aria-label="Sélectionnez le ratio linguistique"
            >
              <option value="">— Non renseigné —</option>
              {LANGUAGE_RATIOS.map((ratio) => (
                <option key={ratio} value={ratio}>
                  {LANGUAGE_RATIO_LABELS[ratio]}
                </option>
              ))}
            </select>
            <span className="select-arrow" aria-hidden="true">▾</span>
          </div>
        </div>

        <p className="required-note" aria-live="polite">
          <span aria-hidden="true" className="required">*</span> Champs obligatoires
        </p>

        <button
          type="submit"
          tabIndex={6}
          disabled={!isValid}
          aria-disabled={!isValid}
          className="btn-next"
        >
          Suivant →
        </button>
      </form>

      
    </div>
  )
}
