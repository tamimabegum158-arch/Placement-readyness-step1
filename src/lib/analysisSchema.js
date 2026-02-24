/**
 * Strict analysis entry schema and normalization.
 * All saved entries conform to this shape; legacy entries are normalized on read.
 */

const DEFAULT_OTHER_SKILLS = ['Communication', 'Problem solving', 'Basic coding', 'Projects']

const CATEGORY_TO_KEY = {
  'Core CS': 'coreCS',
  'Languages': 'languages',
  'Web': 'web',
  'Data': 'data',
  'Cloud/DevOps': 'cloud',
  'Testing': 'testing',
}

const KEY_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_TO_KEY).map(([k, v]) => [v, k])
)

/** Normalize extracted skills from jdAnalysis format to schema shape. */
export function normalizeExtractedSkills(extracted) {
  const empty = {
    coreCS: [],
    languages: [],
    web: [],
    data: [],
    cloud: [],
    testing: [],
    other: [],
  }
  if (!extracted?.categories) return { ...empty, other: [...DEFAULT_OTHER_SKILLS] }
  const categories = extracted.categories
  const isGeneralFresher = extracted.isGeneralFresher === true
  const out = { ...empty }
  for (const [cat, key] of Object.entries(CATEGORY_TO_KEY)) {
    out[key] = Array.isArray(categories[cat]) ? [...categories[cat]] : []
  }
  if (isGeneralFresher || Object.values(out).every((arr) => arr.length === 0)) {
    out.other = [...DEFAULT_OTHER_SKILLS]
  }
  return out
}

/** Convert schema extractedSkills back to categories for UI (Key skills section). */
export function extractedSkillsToCategories(extractedSkills) {
  if (!extractedSkills) return {}
  const categories = {}
  for (const [key, cat] of Object.entries(KEY_TO_CATEGORY)) {
    const arr = extractedSkills[key]
    if (Array.isArray(arr) && arr.length > 0) categories[cat] = arr
  }
  if (Array.isArray(extractedSkills.other) && extractedSkills.other.length > 0) {
    categories['Other'] = extractedSkills.other
  }
  return categories
}

/** All skill keys for iteration (including other). */
export function getAllSkillKeys() {
  return ['coreCS', 'languages', 'web', 'data', 'cloud', 'testing', 'other']
}

/** Flatten extractedSkills into list of { category, skill } for toggles. */
export function getAllSkillsFromSchema(extractedSkills) {
  const categories = extractedSkillsToCategories(extractedSkills)
  return Object.entries(categories).flatMap(([cat, skills]) =>
    (skills || []).map((skill) => ({ category: cat, skill }))
  )
}

/** Normalize roundMapping to schema: roundTitle, focusAreas[], whyItMatters. */
export function normalizeRoundMapping(roundMapping) {
  if (!Array.isArray(roundMapping)) return []
  return roundMapping.map((r) => ({
    roundTitle: r.roundTitle ?? r.title ?? `Round ${r.roundNumber ?? 0}`,
    focusAreas: Array.isArray(r.focusAreas) ? r.focusAreas : (r.description ? [r.description] : []),
    whyItMatters: r.whyItMatters ?? '',
  }))
}

/** Normalize checklist to schema: roundTitle, items[]. */
export function normalizeChecklist(checklist) {
  if (!Array.isArray(checklist)) return []
  return checklist.map((c) => ({
    roundTitle: c.roundTitle ?? c.round ?? '',
    items: Array.isArray(c.items) ? c.items : [],
  }))
}

/** Normalize plan to schema: plan7Days = [{ day, focus, tasks[] }]. */
export function normalizePlan7Days(plan) {
  if (!Array.isArray(plan)) return []
  return plan.map((p) => ({
    day: p.day ?? '',
    focus: p.focus ?? p.title ?? '',
    tasks: Array.isArray(p.tasks) ? p.tasks : (Array.isArray(p.items) ? p.items : []),
  }))
}

const NOW = () => new Date().toISOString()

/**
 * Build a full analysis entry in the strict schema.
 */
export function buildAnalysisEntry({
  id,
  createdAt,
  company,
  role,
  jdText,
  extractedSkills,
  plan,
  checklist,
  questions,
  baseScore,
  companyIntel,
  roundMapping,
}) {
  const normalizedSkills = normalizeExtractedSkills(extractedSkills)
  const normalizedRounds = normalizeRoundMapping(roundMapping)
  const normalizedChecklist = normalizeChecklist(checklist)
  const normalizedPlan = normalizePlan7Days(plan)
  const ts = createdAt ?? NOW()
  return {
    id: id ?? `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: ts,
    company: company ?? '',
    role: role ?? '',
    jdText: jdText ?? '',
    extractedSkills: normalizedSkills,
    roundMapping: normalizedRounds,
    checklist: normalizedChecklist,
    plan7Days: normalizedPlan,
    questions: Array.isArray(questions) ? questions.slice(0, 10) : [],
    baseScore: typeof baseScore === 'number' ? baseScore : 0,
    skillConfidenceMap: {},
    finalScore: typeof baseScore === 'number' ? baseScore : 0,
    updatedAt: ts,
    companyIntel: companyIntel ?? null,
  }
}

/**
 * Normalize a raw stored entry (legacy or new) to a single shape for the UI.
 * Returns object with: categories (for Key skills), checklist, plan, questions, finalScore, baseScore, skillConfidenceMap, roundMapping (with title/description/whyItMatters), companyIntel, etc.
 */
export function normalizeEntryForView(entry) {
  if (!entry || !entry.id) return null
  const es = entry.extractedSkills
  const categories = es ? extractedSkillsToCategories(es) : (entry.extractedSkills?.categories ?? {})
  const checklist = entry.checklist ?? []
  const plan = entry.plan7Days ?? entry.plan ?? []
  const roundMapping = entry.roundMapping ?? []
  return {
    ...entry,
    extractedSkills: { ...entry.extractedSkills, categories },
    checklist: checklist.map((c) => ({ round: c.roundTitle ?? c.round, items: c.items ?? [] })),
    plan: plan.map((p) => ({
      day: p.day,
      title: p.focus ?? p.title,
      items: p.tasks ?? p.items ?? [],
    })),
    questions: Array.isArray(entry.questions) ? entry.questions : [],
    readinessScore: entry.finalScore ?? entry.readinessScore ?? 0,
    baseReadinessScore: entry.baseScore ?? entry.baseReadinessScore ?? 0,
    roundMapping: roundMapping.map((r, i) => ({
      roundNumber: r.roundNumber ?? i + 1,
      title: r.roundTitle ?? r.title,
      description: (r.focusAreas && r.focusAreas[0]) ?? r.description ?? '',
      whyItMatters: r.whyItMatters ?? '',
    })),
  }
}

/** Validate a raw entry; return true if usable. */
export function isValidEntry(entry) {
  try {
    if (!entry || typeof entry !== 'object') return false
    if (!entry.id || typeof entry.id !== 'string') return false
    if (!entry.jdText || typeof entry.jdText !== 'string') return false
    return true
  } catch {
    return false
  }
}
