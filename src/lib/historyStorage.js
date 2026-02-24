const STORAGE_KEY = 'placement_readiness_history'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Save analysis result to localStorage and return the saved entry (with id, createdAt).
 */
export function saveAnalysis({ company, role, jdText, extractedSkills, plan, checklist, questions, readinessScore }) {
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
    readinessScore: readinessScore ?? 0,
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
