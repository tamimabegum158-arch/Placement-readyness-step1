import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { runAnalysis } from '@/lib/jdAnalysis'
import { saveAnalysis } from '@/lib/historyStorage'

export default function Analyze() {
  const navigate = useNavigate()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const trimmedJd = (jdText || '').trim()
    if (!trimmedJd) {
      setError('Please paste the job description.')
      return
    }
    setLoading(true)
    try {
      const result = runAnalysis(company.trim(), role.trim(), trimmedJd)
      const entry = saveAnalysis({
        company: company.trim(),
        role: role.trim(),
        jdText: trimmedJd,
        ...result,
      })
      navigate('/dashboard/results', { state: { entry }, replace: false })
    } catch (err) {
      setError('Analysis failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Analyze JD</h2>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Job description analysis</CardTitle>
          <CardDescription>
            Paste the job description below. We'll extract skills and generate a preparation plan (no data sent online).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company (optional)
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g. Google, Microsoft"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role (optional)
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g. SDE 1, Full Stack Developer"
              />
            </div>
            <div>
              <label htmlFor="jd" className="block text-sm font-medium text-gray-700 mb-1">
                Job description <span className="text-gray-500">(required)</span>
              </label>
              <textarea
                id="jd"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 bg-white focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                placeholder="Paste the full job description here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Longer JDs (800+ chars) can improve your readiness score.
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
