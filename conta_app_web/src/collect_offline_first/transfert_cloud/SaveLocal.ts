// ─── SaveLocal.ts ─────────────────────────────────────────────────────────────
// Gestion IndexedDB + transfert vers Supabase
// Adapté aux types database.types.ts
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../../lib/supabaseClient'
import type { WitnessFormData } from '../form_witness/WitnessForm'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SyncStatus = 'pending' | 'synced' | 'error'

// Correspond à collect_info_temoin (database.types.ts)
export interface WitnessLocalRecord {
  id?:            number
  name:           string        // ✅ présent dans DB
  first_name:     string
  age:            number
  accept_rgpd:    boolean
  departement_id: string        // FK → departements.id
  region_id:      string        // FK → regions_corse.id
  audio_id:       number | null // FK locale (IndexedDB) — converti en string uuid avant insert Supabase
  created_at:     string
  sync_status:    SyncStatus
  supabase_id:    string | null
}

// Correspond à collect_audio (database.types.ts)
export interface AudioLocalRecord {
  id?:              number
  witness_local_id: number
  file_blob:        Blob
  file_name:        string
  file_type:        string
  duration:         string        // HH:MM:SS → TIME en DB
  created_at:       string
  cloud_url:        string
  sync_status:      SyncStatus
  supabase_id:      string | null
}

export interface TransfertResult {
  success:  boolean
  uploaded: number
  failed:   number
  errors:   string[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DB_NAME       = 'conta_db'
const DB_VERSION    = 1
const STORE_WITNESS = 'collect_info_temoin'
const STORE_AUDIO   = 'collect_audio'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function secondsToTime(s: number): string {
  const h   = Math.floor(s / 3600)
  const m   = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':')
}

export function isOnline(): boolean {
  return navigator.onLine
}

// ─── Open / Init DB ───────────────────────────────────────────────────────────

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db     = (event.target as IDBOpenDBRequest).result
      const oldVer = event.oldVersion

      if (oldVer < 1) {
        const witnessStore = db.createObjectStore(STORE_WITNESS, {
          keyPath: 'id', autoIncrement: true,
        })
        witnessStore.createIndex('departement_id', 'departement_id', { unique: false })
        witnessStore.createIndex('region_id',      'region_id',      { unique: false })
        witnessStore.createIndex('audio_id',       'audio_id',       { unique: false })
        witnessStore.createIndex('sync_status',    'sync_status',    { unique: false })
        witnessStore.createIndex('created_at',     'created_at',     { unique: false })

        const audioStore = db.createObjectStore(STORE_AUDIO, {
          keyPath: 'id', autoIncrement: true,
        })
        audioStore.createIndex('witness_local_id', 'witness_local_id', { unique: false })
        audioStore.createIndex('sync_status',      'sync_status',      { unique: false })
        audioStore.createIndex('created_at',       'created_at',       { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// WITNESS
// ═══════════════════════════════════════════════════════════════════════════════

export async function saveWitnessLocally(
  formData: WitnessFormData
): Promise<number> {
  const record: WitnessLocalRecord = {
    name:           formData.name,
    first_name:     formData.first_name,
    age:            formData.age as number,
    accept_rgpd:    false,
    departement_id: formData.departement_id,
    region_id:      formData.region_id,
    audio_id:       null,
    created_at:     new Date().toISOString(),
    sync_status:    'pending',
    supabase_id:    null,
  }
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WITNESS, 'readwrite')
    const request = tx.objectStore(STORE_WITNESS).add(record)
    request.onsuccess = () => resolve(request.result as number)
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

export async function getWitnessById(id: number): Promise<WitnessLocalRecord | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WITNESS, 'readonly')
    const request = tx.objectStore(STORE_WITNESS).get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

export async function getAllWitnesses(): Promise<WitnessLocalRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WITNESS, 'readonly')
    const request = tx.objectStore(STORE_WITNESS).getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

export async function getPendingWitnesses(): Promise<WitnessLocalRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_WITNESS, 'readonly')
    const index = tx.objectStore(STORE_WITNESS).index('sync_status')
    const request = index.getAll(IDBKeyRange.only('pending'))
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

export async function deleteWitness(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WITNESS, 'readwrite')
    const request = tx.objectStore(STORE_WITNESS).delete(id)
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════════════════════════════

export interface SaveAudioParams {
  witnessLocalId: number
  file:           File
  duration:       number
  cloudUrl:       string
}

export async function saveAudioLocally(params: SaveAudioParams): Promise<number> {
  const record: AudioLocalRecord = {
    witness_local_id: params.witnessLocalId,
    file_blob:        params.file,
    file_name:        params.file.name,
    file_type:        params.file.type,
    duration:         secondsToTime(params.duration),
    created_at:       new Date().toISOString(),
    cloud_url:        params.cloudUrl,
    sync_status:      params.cloudUrl ? 'synced' : 'pending',
    supabase_id:      null,
  }
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite')
    const request = tx.objectStore(STORE_AUDIO).add(record)
    request.onsuccess = () => resolve(request.result as number)
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

export async function getAudioById(id: number): Promise<AudioLocalRecord | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readonly')
    const request = tx.objectStore(STORE_AUDIO).get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

export async function getAllAudios(): Promise<AudioLocalRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readonly')
    const request = tx.objectStore(STORE_AUDIO).getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

export async function deleteAudio(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite')
    const request = tx.objectStore(STORE_AUDIO).delete(id)
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
    tx.oncomplete     = () => db.close()
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIAISON audio_id ↔ witness
// ═══════════════════════════════════════════════════════════════════════════════

export interface LinkAudioParams {
  witnessLocalId: number
  audioLocalId:   number
  acceptRgpd:     boolean
  cloudUrl:       string
}

export async function linkAudioToWitness(params: LinkAudioParams): Promise<void> {
  const witness = await getWitnessById(params.witnessLocalId)
  const audio   = await getAudioById(params.audioLocalId)

  if (!witness) throw new Error(`Witness id=${params.witnessLocalId} introuvable`)
  if (!audio)   throw new Error(`Audio id=${params.audioLocalId} introuvable`)

  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_WITNESS, STORE_AUDIO], 'readwrite')

    tx.objectStore(STORE_WITNESS).put({
      ...witness,
      audio_id:    params.audioLocalId,
      accept_rgpd: params.acceptRgpd,
    })

    tx.objectStore(STORE_AUDIO).put({
      ...audio,
      cloud_url:   params.cloudUrl,
      sync_status: params.cloudUrl ? 'synced' : 'pending',
    })

    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror    = () => reject(tx.error)
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFERT VERS SUPABASE
// ═══════════════════════════════════════════════════════════════════════════════

export async function transfertToSupabase(): Promise<TransfertResult> {
  const result: TransfertResult = {
    success:  true,
    uploaded: 0,
    failed:   0,
    errors:   [],
  }

  const pendingWitnesses = await getPendingWitnesses()
  if (pendingWitnesses.length === 0) return result

  for (const witness of pendingWitnesses) {
    const witnessLocalId = witness.id!

    try {
      let audioSupabaseId: string | null = null

      // ── 1. Upload audio ──────────────────────────────────────────────────────
      if (witness.audio_id !== null) {
        const audio = await getAudioById(witness.audio_id)

        if (audio && audio.sync_status !== 'synced') {
          const fileName = `${Date.now()}_${audio.file_name}`
          const filePath = `audios/${fileName}`

          const { error: storageError } = await supabase.storage
            .from('collect_audio')
            .upload(filePath, audio.file_blob, {
              contentType: audio.file_type,
              upsert: false,
            })

          if (storageError) throw new Error(`Storage : ${storageError.message}`)

          const { data: { publicUrl } } = supabase.storage
            .from('collect_audio')
            .getPublicUrl(filePath)

          // ── 2. Insert collect_audio ──────────────────────────────────────────
          const { data: audioData, error: audioDbError } = await supabase
            .from('collect_audio')
            .insert({
              url:        publicUrl,
              duration:   audio.duration,
              created_at: audio.created_at ?? undefined,
            })
            .select('id')
            .single()

          if (audioDbError) throw new Error(`Audio DB : ${audioDbError.message}`)

          audioSupabaseId = audioData.id

          // Marque audio comme synced dans IndexedDB
          const dbAudio = await openDB()
          await new Promise<void>((res, rej) => {
            const tx = dbAudio.transaction(STORE_AUDIO, 'readwrite')
            tx.objectStore(STORE_AUDIO).put({
              ...audio,
              sync_status: 'synced' as SyncStatus,
              supabase_id: audioSupabaseId,
            })
            tx.oncomplete = () => { dbAudio.close(); res() }
            tx.onerror    = () => rej(tx.error)
          })

        } else if (audio?.sync_status === 'synced') {
          audioSupabaseId = audio.supabase_id
        }
      }

      // ── 3. Insert collect_info_temoin ────────────────────────────────────────
      // audio_id est obligatoire (string) dans la table — on vérifie avant
      if (!audioSupabaseId) throw new Error('audio_id Supabase manquant — insert annulé')

      const { data: witnessData, error: witnessError } = await supabase
        .from('collect_info_temoin')
        .insert({
          name:           witness.name,
          first_name:     witness.first_name,
          age:            witness.age,
          accept_rgpd:    witness.accept_rgpd,
          departement_id: witness.departement_id,
          region_id:      witness.region_id,
          audio_id:       audioSupabaseId,   // ✅ string garanti
        })
        .select('id')
        .single()

      if (witnessError) throw new Error(`Témoin DB : ${witnessError.message}`)

      // ── 4. Marque witness comme synced puis supprime de l'IndexedDB ──────────
      const dbWitness = await openDB()
      await new Promise<void>((res, rej) => {
        const tx = dbWitness.transaction(STORE_WITNESS, 'readwrite')
        tx.objectStore(STORE_WITNESS).put({
          ...witness,
          sync_status: 'synced' as SyncStatus,
          supabase_id: witnessData.id,
        })
        tx.oncomplete = () => { dbWitness.close(); res() }
        tx.onerror    = () => rej(tx.error)
      })

      await deleteWitness(witnessLocalId)
      if (witness.audio_id !== null) await deleteAudio(witness.audio_id)

      result.uploaded++

    } catch (err: any) {
      result.failed++
      result.errors.push(err.message ?? 'Erreur inconnue')
      result.success = false
    }
  }

  return result
}

// ═══════════════════════════════════════════════════════════════════════════════
// PURGE
// ═══════════════════════════════════════════════════════════════════════════════

export async function clearAllLocalData(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_WITNESS, STORE_AUDIO], 'readwrite')
    tx.objectStore(STORE_WITNESS).clear()
    tx.objectStore(STORE_AUDIO).clear()
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror    = () => reject(tx.error)
  })
}

export function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('conta_db')
    request.onsuccess = () => resolve()
    request.onerror   = () => reject(request.error)
  })
}
