const STORAGE_KEY = 'prp_test_checklist'
const LENGTH = 10

function defaultChecklist() {
  return Array.from({ length: LENGTH }, () => false)
}

/**
 * Get the test checklist (array of 10 booleans). Persists in localStorage.
 */
export function getChecklist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultChecklist()
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr) || arr.length !== LENGTH) return defaultChecklist()
    return arr.slice(0, LENGTH).map((v) => Boolean(v))
  } catch (e) {
    console.error('getChecklist', e)
    return defaultChecklist()
  }
}

/**
 * Save checklist. Pass array of 10 booleans.
 */
export function setChecklist(arr) {
  const normalized = Array.from({ length: LENGTH }, (_, i) => Boolean(arr[i]))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch (e) {
    console.error('setChecklist', e)
    return normalized
  }
}

/**
 * Reset all items to unchecked.
 */
export function resetChecklist() {
  return setChecklist(defaultChecklist())
}

/**
 * Whether all 10 tests are passed (for ship lock).
 */
export function isChecklistComplete() {
  const arr = getChecklist()
  return arr.length === LENGTH && arr.every(Boolean)
}
