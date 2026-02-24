import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getAllHistory } from '@/lib/historyStorage'
import { History as HistoryIcon } from 'lucide-react'

export default function History() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])

  useEffect(() => {
    setEntries(getAllHistory())
  }, [])

  function openResult(entry) {
    navigate(`/dashboard/results?id=${entry.id}`, { state: { entry } })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Analysis history</h2>
      <Card>
        <CardHeader>
          <CardTitle>Saved analyses</CardTitle>
          <CardDescription>
            Click an entry to view full results. Data is stored locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-gray-500 py-4">No analyses yet. Run one from the Analyze page.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {entries.map((entry) => {
                const date = entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : '—'
                return (
                  <li
                    key={entry.id}
                    className="py-3 first:pt-0 flex items-center justify-between gap-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg cursor-pointer"
                    onClick={() => openResult(entry)}
                    onKeyDown={(e) => e.key === 'Enter' && openResult(entry)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <HistoryIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {entry.company || 'No company'} · {entry.role || 'No role'}
                        </p>
                        <p className="text-sm text-gray-500">{date}</p>
                      </div>
                    </div>
                    <div className="shrink-0 w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900">{entry.readinessScore ?? 0}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
