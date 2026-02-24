import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { isChecklistComplete } from '@/lib/testChecklistStorage'

export default function Ship() {
  const navigate = useNavigate()
  const unlocked = isChecklistComplete()

  useEffect(() => {
    if (!unlocked) {
      navigate('/prp/07-test', { replace: true })
    }
  }, [unlocked, navigate])

  if (!unlocked) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Ship</h1>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        {unlocked ? (
          <Card>
            <CardHeader>
              <CardTitle>Ready to ship</CardTitle>
              <CardDescription>
                All 10 tests are passed. Your Placement Readiness Platform is verified and ready.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                You can deploy or share the application. Keep the test checklist for future regressions.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
