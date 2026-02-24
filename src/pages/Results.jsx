import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getHistoryById, getLatestHistory, updateHistoryEntry } from '@/lib/historyStorage'
import { CATEGORY_ORDER } from '@/lib/skillCategories'

function clampScore(score) {
  return Math.min(100, Math.max(0, Math.round(score)))
}

/** Build list of all skills from categories for display + toggles */
function getAllSkillsFromCategories(categories) {
  const catsWithSkills = CATEGORY_ORDER.filter((c) => categories[c]?.length)
  const displayCats = catsWithSkills.length > 0 ? catsWithSkills : ['General']
  return displayCats.flatMap((cat) => (categories[cat] || []).map((skill) => ({ category: cat, skill })))
}

/** Compute live readiness: base + 2 per "know", -2 per "practice" */
function computeLiveScore(baseScore, skillConfidenceMap, allSkills) {
  let know = 0
  let practice = 0
  allSkills.forEach(({ skill }) => {
    const c = skillConfidenceMap[skill]
    if (c === 'know') know++
    else practice++
  })
  return clampScore(baseScore + 2 * know - 2 * practice)
}

/** Plain text for 7-day plan */
function planToText(plan) {
  if (!plan?.length) return ''
  return plan
    .map(
      (block) =>
        `${block.day}: ${block.title}\n${(block.items || []).map((i) => `  • ${i}`).join('\n')}`
    )
    .join('\n\n')
}

/** Plain text for round checklist */
function checklistToText(checklist) {
  if (!checklist?.length) return ''
  return checklist
    .map(
      (round) =>
        `${round.round}\n${(round.items || []).map((i) => `  • ${i}`).join('\n')}`
    )
    .join('\n\n')
}

/** Plain text for questions */
function questionsToText(questions) {
  if (!questions?.length) return ''
  return questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
}

/** Full document for download */
function buildFullTxt(entry) {
  const { company, role, extractedSkills, checklist, plan, questions, readinessScore } = entry
  const cats = extractedSkills?.categories ?? {}
  const skillsByCat = Object.entries(cats)
    .map(([cat, skills]) => `${cat}: ${(skills || []).join(', ')}`)
    .join('\n')
  return [
    `Placement Readiness – ${company || 'Company'} ${role ? `· ${role}` : ''}`,
    `Readiness score: ${readinessScore}/100`,
    '',
    '--- Key skills extracted ---',
    skillsByCat,
    '',
    '--- Round-wise checklist ---',
    checklistToText(checklist),
    '',
    '--- 7-day plan ---',
    planToText(plan),
    '',
    '--- 10 likely interview questions ---',
    questionsToText(questions),
  ].join('\n')
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const idFromUrl = searchParams.get('id')
  const [entry, setEntry] = useState(location.state?.entry ?? null)
  const [loading, setLoading] = useState(!entry && (!!idFromUrl || !location.state))

  useEffect(() => {
    if (entry) return
    if (idFromUrl) {
      const found = getHistoryById(idFromUrl)
      setEntry(found)
    } else {
      const latest = getLatestHistory()
      setEntry(latest)
    }
    setLoading(false)
  }, [idFromUrl, entry])

  const updateEntry = useCallback(
    (updates) => {
      if (!entry?.id) return
      const next = { ...entry, ...updates }
      setEntry(next)
      updateHistoryEntry(entry.id, updates)
    },
    [entry]
  )

  const setSkillConfidence = useCallback(
    (skill, value) => {
      const map = { ...(entry?.skillConfidenceMap ?? {}) }
      map[skill] = value
      const allSkills = getAllSkillsFromCategories(entry?.extractedSkills?.categories ?? {})
      const base = entry?.baseReadinessScore ?? entry?.readinessScore ?? 0
      const liveScore = computeLiveScore(base, map, allSkills)
      updateEntry({ skillConfidenceMap: map, readinessScore: liveScore })
    },
    [entry, updateEntry]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Results</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">No analysis found. Run an analysis from the Analyze page first.</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard/analyze')}
              className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover"
            >
              Go to Analyze
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const categories = entry.extractedSkills?.categories ?? {}
  const skillConfidenceMap = entry.skillConfidenceMap ?? {}
  const allSkills = getAllSkillsFromCategories(categories)
  const baseScore = entry.baseReadinessScore ?? entry.readinessScore ?? 0
  const liveScore = computeLiveScore(baseScore, skillConfidenceMap, allSkills)
  const displayDate = entry.createdAt
    ? new Date(entry.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : ''

  const practiceSkills = allSkills
    .filter(({ skill }) => skillConfidenceMap[skill] !== 'know')
    .map(({ skill }) => skill)
  const top3Weak = practiceSkills.slice(0, 3)

  const handleCopyPlan = () => {
    const text = planToText(entry.plan)
    navigator.clipboard.writeText(text || 'No plan.')
  }
  const handleCopyChecklist = () => {
    const text = checklistToText(entry.checklist)
    navigator.clipboard.writeText(text || 'No checklist.')
  }
  const handleCopyQuestions = () => {
    const text = questionsToText(entry.questions)
    navigator.clipboard.writeText(text || 'No questions.')
  }
  const handleDownloadTxt = () => {
    const text = buildFullTxt({ ...entry, readinessScore: liveScore })
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = (entry.company || 'analysis').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 40) || 'analysis'
    a.download = `placement-readiness-${safeName}-${entry.id.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Analysis results</h2>
        {displayDate && (
          <span className="text-sm text-gray-500">
            {entry.company && `${entry.company}${entry.role ? ` · ${entry.role}` : ''}`} · {displayDate}
          </span>
        )}
      </div>

      {/* Readiness score – live */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness score</CardTitle>
          <CardDescription>
            Base score from JD; +2 per skill marked “I know”, −2 per “Need practice”. Updates as you toggle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{liveScore}</span>
            </div>
            <p className="text-gray-600">out of 100</p>
          </div>
        </CardContent>
      </Card>

      {/* Key skills extracted – with toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Key skills extracted</CardTitle>
          <CardDescription>
            Mark each skill. Default: Need practice. Changes are saved to this analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const catsWithSkills = CATEGORY_ORDER.filter((c) => categories[c]?.length)
              const displayCats = catsWithSkills.length > 0 ? catsWithSkills : ['General']
              return displayCats.map((cat) => (
                <div key={cat} className="flex flex-wrap items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase w-28 shrink-0 pt-1">{cat}</span>
                  <span className="flex flex-wrap gap-2">
                    {(categories[cat] || []).map((skill) => {
                      const current = skillConfidenceMap[skill] || 'practice'
                      return (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 flex-wrap"
                        >
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-md text-sm ${
                              current === 'know'
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {skill}
                          </span>
                          <span className="inline-flex rounded-lg border border-gray-200 p-0.5">
                            <button
                              type="button"
                              onClick={() => setSkillConfidence(skill, 'know')}
                              className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                                current === 'know'
                                  ? 'bg-primary text-white'
                                  : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              I know this
                            </button>
                            <button
                              type="button"
                              onClick={() => setSkillConfidence(skill, 'practice')}
                              className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                                current === 'practice'
                                  ? 'bg-gray-700 text-white'
                                  : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              Need practice
                            </button>
                          </span>
                        </span>
                      )
                    })}
                  </span>
                </div>
              ))
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Export tools */}
      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Copy or download results as plain text</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyPlan}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Copy 7-day plan
          </button>
          <button
            type="button"
            onClick={handleCopyChecklist}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Copy round checklist
          </button>
          <button
            type="button"
            onClick={handleCopyQuestions}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Copy 10 questions
          </button>
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover"
          >
            Download as TXT
          </button>
        </CardContent>
      </Card>

      {/* Round-wise checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Round-wise preparation checklist</CardTitle>
          <CardDescription>Template-based items adapted to detected skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(entry.checklist || []).map((round) => (
            <div key={round.round}>
              <h4 className="font-medium text-gray-900 mb-2">{round.round}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {(round.items || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 7-day plan */}
      <Card>
        <CardHeader>
          <CardTitle>7-day plan</CardTitle>
          <CardDescription>Adapted to detected skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(entry.plan || []).map((block) => (
            <div key={block.day}>
              <h4 className="font-medium text-gray-900">
                {block.day}: {block.title}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-1">
                {(block.items || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 10 likely questions */}
      <Card>
        <CardHeader>
          <CardTitle>10 likely interview questions</CardTitle>
          <CardDescription>Based on detected skills</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            {(entry.questions || []).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Action Next */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Action next</CardTitle>
          <CardDescription>Focus on these and then start your plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {top3Weak.length > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-700">Top weak areas (need practice):</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {top3Weak.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-600">All listed skills marked as known. Keep revising and run mocks.</p>
          )}
          <p className="text-sm font-medium text-primary">Start Day 1 plan now.</p>
        </CardContent>
      </Card>
    </div>
  )
}
