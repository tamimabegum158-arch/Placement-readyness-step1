import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getChecklist, setChecklist, resetChecklist } from '@/lib/testChecklistStorage'

const TESTS = [
  {
    id: 0,
    label: 'JD required validation works',
    hint: 'Submit Analyze with empty JD; submission should be blocked and show an error.',
  },
  {
    id: 1,
    label: 'Short JD warning shows for <200 chars',
    hint: 'Paste fewer than 200 characters; a warning should appear; analysis can still run.',
  },
  {
    id: 2,
    label: 'Skills extraction groups correctly',
    hint: 'Paste JD with React, SQL, AWS; check Results show Web, Data, Cloud/DevOps groups.',
  },
  {
    id: 3,
    label: 'Round mapping changes based on company + skills',
    hint: 'Try Infosys + DSA vs StartupX + React; round flow should differ.',
  },
  {
    id: 4,
    label: 'Score calculation is deterministic',
    hint: 'Same JD + company + role should yield same base score every time.',
  },
  {
    id: 5,
    label: 'Skill toggles update score live',
    hint: 'On Results, toggle "I know" / "Need practice"; score updates immediately.',
  },
  {
    id: 6,
    label: 'Changes persist after refresh',
    hint: 'Toggle skills, refresh page; toggles and score should remain.',
  },
  {
    id: 7,
    label: 'History saves and loads correctly',
    hint: 'Run analysis, go to History, open entry; full analysis should load.',
  },
  {
    id: 8,
    label: 'Export buttons copy the correct content',
    hint: 'Use Copy 7-day plan, Copy checklist, Copy questions; paste elsewhere to verify.',
  },
  {
    id: 9,
    label: 'No console errors on core pages',
    hint: 'Open Landing, Dashboard, Analyze, Results, History; check DevTools console.',
  },
]

export default function TestChecklist() {
  const [checks, setChecks] = useState(getChecklist())

  useEffect(() => {
    setChecklist(checks)
  }, [checks])

  const passed = checks.filter(Boolean).length
  const allPassed = passed === 10

  const handleToggle = (index) => {
    setChecks((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const handleReset = () => {
    resetChecklist()
    setChecks(getChecklist())
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Test checklist</h1>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tests Passed: {passed} / 10</CardTitle>
            <CardDescription>
              Complete each test manually and check the box when it passes.
            </CardDescription>
            {!allPassed && (
              <p className="text-sm font-medium text-amber-700 mt-2">
                Fix issues before shipping.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {TESTS.map(({ id, label, hint }) => (
              <label
                key={id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!checks[id]}
                  onChange={() => handleToggle(id)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{label}</span>
                  {hint && (
                    <p className="text-sm text-gray-500 mt-0.5">How to test: {hint}</p>
                  )}
                </div>
              </label>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                Reset checklist
              </button>
              {allPassed && (
                <Link
                  to="/prp/08-ship"
                  className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover"
                >
                  Go to Ship
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
