import { buildAnalysisEntry } from './analysisSchema'

const STORAGE_KEY = 'placement_readiness_history'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function parseList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.error('parseList', e)
    return []
  }
}

function isValidEntry(entry) {
  try {
    if (!entry || typeof entry !== 'object') return false
    if (!entry.id || typeof entry.id !== 'string') return false
    if (typeof entry.jdText !== 'string') return false
    return true
  } catch {
    return false
  }
}

/**
 * Save analysis result in strict schema. Builds entry via analysisSchema.
 */
export function saveAnalysis({
  company,
  role,
  jdText,
  extractedSkills,
  plan,
  checklist,
  questions,
  readinessScore,
  companyIntel,
  roundMapping,
}) {
  const baseScore = readinessScore ?? 0
  const entry = buildAnalysisEntry({
    id: generateId(),
    createdAt: new Date().toISOString(),
    company: company ?? '',
    role: role ?? '',
    jdText: jdText ?? '',
    extractedSkills: extractedSkills ?? { categories: {}, allSkills: [], isGeneralFresher: true },
    plan: plan ?? [],
    checklist: checklist ?? [],
    questions: questions ?? [],
    baseScore,
    companyIntel: companyIntel ?? null,
    roundMapping: roundMapping ?? [],
  })
  entry.finalScore = baseScore
  try {
    const list = parseList()
    list.unshift(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return entry
  } catch (e) {
    console.error('saveAnalysis', e)
    return entry
  }
}

/**
 * Update an existing history entry. Only finalScore, skillConfidenceMap, updatedAt are updated.
 */
export function updateHistoryEntry(id, updates) {
  try {
    const list = parseList()
    const index = list.findIndex((e) => e.id === id)
    if (index === -1) return null
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    list[index] = updated
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return updated
  } catch (e) {
    console.error('updateHistoryEntry', e)
    return null
  }
}

/**
 * Get all history entries (newest first). Validates each; skips corrupted.
 * Returns { entries, corruptedCount }.
 */
export function getAllHistory() {
  const list = parseList()
  const valid = []
  let corruptedCount = 0
  for (const entry of list) {
    if (isValidEntry(entry)) valid.push(entry)
    else corruptedCount++
  }
  return { entries: valid, corruptedCount }
}

/**
 * Get a single entry by id. Returns null if not found or invalid.
 */
export function getHistoryById(id) {
  const { entries } = getAllHistory()
  return entries.find((e) => e.id === id) ?? null
}

/**
 * Get the latest valid entry.
 */
export function getLatestHistory() {
  const { entries } = getAllHistory()
  return entries.length > 0 ? entries[0] : null
}
