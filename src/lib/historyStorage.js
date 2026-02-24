const STORAGE_KEY = 'placement_readiness_history'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Save analysis result to localStorage and return the saved entry (with id, createdAt).
 * Stores baseReadinessScore so live score can be recomputed from skill toggles.
 */
export function saveAnalysis({ company, role, jdText, extractedSkills, plan, checklist, questions, readinessScore }) {
  const base = readinessScore ?? 0
  const entry = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    company: company ?? '',
    role: role ?? '',
    jdText: jdText ?? '',
    extractedSkills: extractedSkills ?? { categories: {}, allSkills: [], isGeneralFresher: true },
    plan: plan ?? [],
    checklist: checklist ?? [],
    questions: questions ?? [],
    readinessScore: base,
    baseReadinessScore: base,
    skillConfidenceMap: {},
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    list.unshift(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return entry
  } catch (e) {
    console.error('saveAnalysis', e)
    return entry
  }
}

/**
 * Update an existing history entry by id. Merges updates (e.g. skillConfidenceMap, readinessScore).
 * Persists to localStorage so changes survive refresh and reopen from History.
 */
export function updateHistoryEntry(id, updates) {
  try {
    const list = getAllHistory()
    const index = list.findIndex((e) => e.id === id)
    if (index === -1) return null
    const updated = { ...list[index], ...updates }
    list[index] = updated
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return updated
  } catch (e) {
    console.error('updateHistoryEntry', e)
    return null
  }
}

/**
 * Get all history entries (newest first).
 */
export function getAllHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.error('getAllHistory', e)
    return []
  }
}

/**
 * Get a single entry by id.
 */
export function getHistoryById(id) {
  const list = getAllHistory()
  return list.find((e) => e.id === id) ?? null
}

/**
 * Get the latest entry (most recent analysis).
 */
export function getLatestHistory() {
  const list = getAllHistory()
  return list.length > 0 ? list[0] : null
}
