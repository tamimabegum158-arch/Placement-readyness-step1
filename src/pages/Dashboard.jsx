import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

const READINESS_MAX = 100
const CIRCLE_R = 80
const CIRCLE_CX = 100
const CIRCLE_CY = 100
const circumference = 2 * Math.PI * CIRCLE_R

function clamp(min, value, max) {
  return Math.min(max, Math.max(min, value))
}

// Use raw score; display and circle clamp to 0–100 (e.g. 120 → 100, -10 → 0)
const readinessRaw = 72
const readinessScore = clamp(0, readinessRaw, READINESS_MAX)
const strokeDashoffset = circumference * (1 - readinessScore / READINESS_MAX)

const skillData = [
  { subject: 'DSA', value: 75, fullMark: 100 },
  { subject: 'System Design', value: 60, fullMark: 100 },
  { subject: 'Communication', value: 80, fullMark: 100 },
  { subject: 'Resume', value: 85, fullMark: 100 },
  { subject: 'Aptitude', value: 70, fullMark: 100 },
]

const weeklyDays = [
  { day: 'Mon', active: true },
  { day: 'Tue', active: true },
  { day: 'Wed', active: false },
  { day: 'Thu', active: true },
  { day: 'Fri', active: true },
  { day: 'Sat', active: true },
  { day: 'Sun', active: false },
]

const weeklySolved = 12
const weeklyTarget = 20
const weeklyPercent = Math.min(100, Math.max(0, (weeklySolved / weeklyTarget) * 100))

const assessments = [
  { title: 'DSA Mock Test', when: 'Tomorrow, 10:00 AM' },
  { title: 'System Design Review', when: 'Wed, 2:00 PM' },
  { title: 'HR Interview Prep', when: 'Friday, 11:00 AM' },
]

// Continue Practice: edge case when completed >= total → "All topics complete!"
const practiceTopic = 'Dynamic Programming'
const practiceCompleted = 3
const practiceTotal = 10
const practiceComplete = practiceCompleted >= practiceTotal
const practicePercent = practiceTotal > 0 ? Math.min(100, (practiceCompleted / practiceTotal) * 100) : 0

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Overall Readiness — circular progress, clamped 0–100 */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center">
              <svg width={200} height={200} className="-rotate-90 shrink-0">
                <circle
                  cx={CIRCLE_CX}
                  cy={CIRCLE_CY}
                  r={CIRCLE_R}
                  fill="none"
                  stroke="rgb(229 231 235)"
                  strokeWidth={12}
                />
                <circle
                  cx={CIRCLE_CX}
                  cy={CIRCLE_CY}
                  r={CIRCLE_R}
                  fill="none"
                  stroke="hsl(245, 58%, 51%)"
                  strokeWidth={12}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {readinessScore}/{READINESS_MAX}
                </span>
                <span className="text-sm text-gray-500">Readiness Score</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Skill Breakdown — 5 axes, ResponsiveContainer, no overflow */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
            <CardDescription>Scores across key areas</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden min-w-0">
            <div className="h-[240px] w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
                  <PolarGrid stroke="rgb(229 231 235)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#374151', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(245, 58%, 51%)"
                    fill="hsl(245, 58%, 51%)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Continue Practice — 3/10, 30% bar; edge case: "All topics complete!" */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Practice</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            {practiceComplete ? (
              <p className="font-medium text-gray-900 mb-2">All topics complete!</p>
            ) : (
              <>
                <p className="font-medium text-gray-900 mb-2">{practiceTopic}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-0">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${practicePercent}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 shrink-0">
                    {practiceCompleted}/{practiceTotal} completed
                  </span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
            >
              {practiceComplete ? 'Start new track' : 'Continue'}
            </button>
          </CardFooter>
        </Card>

        {/* 4. Weekly Goals — 12/20, progress bar, 7 day circles */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
            <CardDescription>Problems solved this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Problems Solved: {weeklySolved}/{weeklyTarget} this week
              </p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${weeklyPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-1">
              {weeklyDays.map(({ day, active }) => (
                <div
                  key={day}
                  className="flex flex-col items-center gap-1 min-w-0 flex-1"
                  title={day}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium shrink-0 ${
                      active
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-200 text-gray-400 bg-gray-50'
                    }`}
                  >
                    {day.slice(0, 1)}
                  </div>
                  <span className="text-xs text-gray-500 truncate w-full text-center">
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5. Upcoming Assessments — 3 items, clean aligned layout */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
            <CardDescription>Scheduled tests and reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100">
              {assessments.map(({ title, when }) => (
                <li
                  key={title}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <span className="font-medium text-gray-900 truncate min-w-0">
                    {title}
                  </span>
                  <span className="text-sm text-gray-500 shrink-0">{when}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
