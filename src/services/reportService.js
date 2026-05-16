import supabase, { isSupabaseConfigured } from '../lib/supabaseClient'
import {
  getLocalReportById,
  getLocalReports,
  saveLocalReport,
} from './localReportStore'

const TABLE = 'criminal_reports'
const MAX_CASE_NUMBER_ATTEMPTS = 5

/** Reports are stored in the browser when Supabase is not configured. */
export function isUsingLocalReportStorage() {
  return !isSupabaseConfigured()
}

/**
 * @returns {string} e.g. CR-2026-4821
 */
export function generateCaseNumber() {
  const year = new Date().getFullYear()
  const suffix = String(Math.floor(1000 + Math.random() * 9000))
  return `CR-${year}-${suffix}`
}

/**
 * @param {Record<string, string>} descriptors Witness form values (camelCase keys)
 * @returns {Record<string, string | number | null>}
 */
function mapDescriptorsToRow(descriptors) {
  const d = descriptors ?? {}

  return {
    gender: d.gender || null,
    face_shape: d.faceShape || null,
    skin_tone: d.skinTone || null,
    ethnicity: d.ethnicity || null,
    age_range: d.ageRange || null,

    eye_shape: d.eyeShape || null,
    eye_color: d.eyeColor || null,
    eye_size: d.eyeSize || null,
    eyebrow_thickness: d.eyebrowThickness || null,
    eyebrow_shape: d.eyebrowShape || null,

    nose_type: d.noseType || null,
    nose_size: d.noseSize || null,
    nostril_width: d.nostrilWidth || null,
    nose_bridge: d.noseBridgeHeight || null,

    lip_thickness: d.lipThickness || null,
    mouth_width: d.mouthWidth || null,

    hair_color: d.hairColor || null,
    hair_length: d.hairLength || null,
    hair_style: d.hairStyle || null,

    facial_hair: d.facialHair || null,

    cheekbone_prominence: d.cheekboneProminence || null,
    jaw_shape: d.jawShape || null,
    jaw_width: d.jawWidth || null,
    forehead_size: d.foreheadSize || null,

    scar_location: d.scarLocation || null,
    scar_description: d.scars || null,
    tattoos: d.tattoos || null,
    birthmark_location: d.birthmarkLocation || null,
    birthmark_description: d.birthmarks || null,
    glasses: d.glasses || null,
    other_features: d.otherFeatures || null,

    height: d.height || null,
    build: d.build || null,
  }
}

/**
 * @param {unknown} error
 */
function formatSupabaseError(error, fallback) {
  if (!error) return fallback
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : String(error)
  return message || fallback
}

/**
 * @param {Record<string, string>} descriptors
 * @param {string} imageUrl
 * @param {number} selectedImageNumber 1–4
 * @param {string} [notes] Optional case notes
 * @returns {Promise<object>} Saved report row (includes id, case_number)
 */
export async function saveReport(
  descriptors,
  imageUrl,
  selectedImageNumber,
  notes = '',
) {
  if (!imageUrl?.trim()) {
    throw new Error('Cannot save report: a generated image URL is required.')
  }

  const imageNum = Number(selectedImageNumber)
  if (
    !Number.isInteger(imageNum) ||
    imageNum < 1 ||
    imageNum > 4
  ) {
    throw new Error(
      'Cannot save report: selected image number must be between 1 and 4.',
    )
  }

  const row = {
    ...mapDescriptorsToRow(descriptors),
    generated_image_url: imageUrl.trim(),
    selected_image_number: imageNum,
    notes: notes?.trim() ? notes.trim() : null,
  }

  if (!isSupabaseConfigured()) {
    return saveLocalReport({
      ...row,
      id: crypto.randomUUID(),
      case_number: generateCaseNumber(),
      created_at: new Date().toISOString(),
    })
  }

  let lastError = null

  for (let attempt = 0; attempt < MAX_CASE_NUMBER_ATTEMPTS; attempt += 1) {
    const case_number = generateCaseNumber()

    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...row, case_number })
      .select()
      .single()

    if (!error) {
      return data
    }

    lastError = error

    if (error.code !== '23505') {
      break
    }
  }

  throw new Error(
    `Failed to save criminal report: ${formatSupabaseError(
      lastError,
      'Unknown database error',
    )}`,
  )
}

/**
 * @returns {Promise<object[]>}
 */
export async function getAllReports() {
  if (!isSupabaseConfigured()) {
    return getLocalReports()
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    const msg = formatSupabaseError(error, 'Unknown database error')
    if (/criminal_reports/i.test(msg) && /schema cache|does not exist|not find/i.test(msg)) {
      throw new Error(
        `Failed to load criminal reports: ${msg} Run supabase/criminal_reports.sql in your Supabase project (SQL Editor), then restart npm run dev.`,
      )
    }
    throw new Error(`Failed to load criminal reports: ${msg}`)
  }

  return data ?? []
}

/**
 * @param {string} id Report UUID
 * @returns {Promise<object>}
 */
export async function getReportById(id) {
  if (!id?.trim()) {
    throw new Error('Cannot load report: a valid report ID is required.')
  }

  if (!isSupabaseConfigured()) {
    const local = getLocalReportById(id.trim())
    if (!local) {
      throw new Error(`No criminal report found with ID "${id}".`)
    }
    return local
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id.trim())
    .maybeSingle()

  if (error) {
    throw new Error(
      `Failed to load criminal report: ${formatSupabaseError(
        error,
        'Unknown database error',
      )}`,
    )
  }

  if (!data) {
    throw new Error(`No criminal report found with ID "${id}".`)
  }

  return data
}
