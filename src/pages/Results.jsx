import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getHistoryById, getLatestHistory } from '@/lib/historyStorage'
import { CATEGORY_ORDER } from '@/lib/skillCategories'

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

  const { company, role, extractedSkills, checklist, plan, questions, readinessScore, createdAt } = entry
  const categories = extractedSkills?.categories ?? {}
  const displayDate = createdAt ? new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Analysis results</h2>
        {displayDate && (
          <span className="text-sm text-gray-500">
            {company && `${company}${role ? ` · ${role}` : ''}`} · {displayDate}
          </span>
        )}
      </div>

      {/* Readiness score */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness score</CardTitle>
          <CardDescription>Based on JD, company, role, and length</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{readinessScore}</span>
            </div>
            <p className="text-gray-600">out of 100</p>
          </div>
        </CardContent>
      </Card>

      {/* Key skills extracted */}
      <Card>
        <CardHeader>
          <CardTitle>Key skills extracted</CardTitle>
          <CardDescription>Detected from the job description (grouped by category)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const catsWithSkills = CATEGORY_ORDER.filter((c) => categories[c]?.length)
              const displayCats = catsWithSkills.length > 0 ? catsWithSkills : ['General']
              return displayCats.map((cat) => (
                <div key={cat} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase w-28 shrink-0">{cat}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {(categories[cat] || []).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </span>
                </div>
              ))
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Round-wise checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Round-wise preparation checklist</CardTitle>
          <CardDescription>Template-based items adapted to detected skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(checklist || []).map((round) => (
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
          {(plan || []).map((block) => (
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
            {(questions || []).map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
