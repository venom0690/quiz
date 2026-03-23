"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface Submission {
  questionNumber: number
  answer: string
  timeTaken: number
  submittedAt: string
}

type TeamData = Record<string, Submission[]>

const correctAnswers: Record<number, string> = {
  1: "51",
  2: "9",
  3: "15",
  4: "missing semicolon",
  5: "B",
  6: "14",
  7: "SMART MINDS WIN",
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

export default function AdminPage() {
  const [data, setData] = useState<TeamData>({})
  const [bannedTeams, setBannedTeams] = useState<string[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState(false)

  const ADMIN_PASSWORD = "admin123"

  const fetchData = useCallback(async () => {
    const [subRes, banRes] = await Promise.all([
      fetch("/api/submissions"),
      fetch("/api/banned"),
    ])
    const json: TeamData = await subRes.json()
    const banned: string[] = await banRes.json()
    setData(json)
    setBannedTeams(banned)
    const teams = Object.keys(json)
    if (teams.length > 0 && !selectedTeam) setSelectedTeam(teams[0])
  }, [selectedTeam])

  useEffect(() => {
    if (authed) {
      fetchData()
      const interval = setInterval(fetchData, 5000) // auto-refresh every 5s
      return () => clearInterval(interval)
    }
  }, [authed, fetchData])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setError(false) }
    else setError(true)
  }

  const handleClearTeam = async () => {
    if (!selectedTeam) return
    await fetch(`/api/submissions?team=${encodeURIComponent(selectedTeam)}`, { method: "DELETE" })
    await fetchData()
    setSelectedTeam(null)
  }

  const handleClearAll = async () => {
    await Promise.all([
      fetch("/api/submissions", { method: "DELETE" }),
      fetch("/api/banned", { method: "DELETE" }),
    ])
    setData({})
    setBannedTeams([])
    setSelectedTeam(null)
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b12]">
        <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-white/90">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter password"
            className="mb-3 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white/90 placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          {error && <p className="mb-3 text-sm text-red-400">Incorrect password.</p>}
          <button onClick={handleLogin} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Login
          </button>
        </div>
      </main>
    )
  }

  const teams = Object.keys(data)
  const submissions: Submission[] = selectedTeam ? (data[selectedTeam] || []) : []
  const grouped = Array.from({ length: 7 }, (_, i) => i + 1).map((qNum) => ({
    qNum,
    submission: submissions.find((s) => s.questionNumber === qNum),
  }))
  const totalTimeTaken = submissions.reduce((sum, s) => sum + s.timeTaken, 0)
  const isSelectedTeamBanned = selectedTeam ? bannedTeams.includes(selectedTeam) : false

  return (
    <main className="min-h-screen bg-[#0b0b12] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white/90">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={fetchData} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/50 hover:text-white/80">
              Refresh
            </button>
            {selectedTeam && (
              <button onClick={handleClearTeam} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20">
                Clear Team
              </button>
            )}
            <button onClick={handleClearAll} className="rounded-xl border border-red-500/50 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30">
              Clear All
            </button>
          </div>
        </div>

        {/* Banned teams — always visible if any */}
        {bannedTeams.length > 0 && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4">
            <p className="mb-3 text-sm font-semibold text-red-400">🚫 Banned Teams</p>
            <div className="flex flex-wrap gap-2">
              {bannedTeams.map((t) => (
                <div key={t} className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5">
                  <span className="text-sm text-red-300">{t}</span>
                  <button
                    onClick={async () => {
                      await fetch(`/api/banned?team=${encodeURIComponent(t)}`, { method: "DELETE" })
                      fetchData()
                    }}
                    className="text-xs text-red-500 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {teams.length === 0 ? (
          <p className="text-white/40">No submissions yet.</p>
        ) : (
          <>
            {/* Team tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              {teams.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTeam(t)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                    selectedTeam === t
                      ? "bg-purple-600 text-white"
                      : "border border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80"
                  )}
                >
                  {bannedTeams.includes(t) && <span className="mr-1">🚫</span>}
                  {t}
                  <span className="ml-2 text-xs opacity-60">{data[t]?.length ?? 0}/7</span>
                </button>
              ))}
            </div>

            {/* Total time / status */}
            {(submissions.length > 0 || isSelectedTeamBanned) && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] px-5 py-3">
                <span className="text-sm text-white/50">Total time to answer all questions:</span>
                <span className="font-mono text-lg font-bold text-purple-300">{formatTime(totalTimeTaken)}</span>
                <span className="text-xs text-white/30">({submissions.length}/7 answered)</span>
                {isSelectedTeamBanned && (
                  <span className="rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-red-300">
                    BANNED
                  </span>
                )}
              </div>
            )}

            {/* Submissions */}
            <div className="space-y-4">
              {grouped.map(({ qNum, submission }) => (
                <div
                  key={qNum}
                  className={cn(
                    "rounded-2xl border p-5",
                    submission ? "border-green-500/20 bg-green-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white/90">Question {qNum}</p>
                      <p className="mt-0.5 text-xs text-white/40">
                        Correct answer: <span className="text-purple-400">{correctAnswers[qNum]}</span>
                      </p>
                    </div>
                    <span className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                      submission ? "bg-green-500/20 text-green-400" : "bg-white/[0.06] text-white/30"
                    )}>
                      {submission ? "Submitted" : "Not answered"}
                    </span>
                  </div>

                  {submission && (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                        <p className="text-xs text-white/40">Answer given</p>
                        <p className="mt-1 font-mono text-sm text-white/90 break-all">{submission.answer}</p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                        <p className="text-xs text-white/40">Time taken</p>
                        <p className="mt-1 font-mono text-sm text-purple-300">{formatTime(submission.timeTaken)}</p>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                        <p className="text-xs text-white/40">Submitted at</p>
                        <p className="mt-1 font-mono text-sm text-white/60">{new Date(submission.submittedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
