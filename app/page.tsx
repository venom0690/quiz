"use client"

import { useState, useCallback } from "react"
import { QuestionCard } from "@/components/question-card"
import { SubmitToast } from "@/components/submit-toast"
import { FullscreenWarning, BannedScreen } from "@/components/fullscreen-guard"
import { useFullscreenGuard } from "@/hooks/use-fullscreen-guard"

const q2Content = {
  title: "Binary Median Challenge",
  tiles: ["1010", "0011", "1111", "0101", "1001"],
  instructions: [
    "Convert each binary number into its decimal equivalent.",
    "Arrange the decimal values in ascending order (smallest to largest).",
    "Identify the middle value from the ordered list.",
    "That middle decimal number will be the final answer.",
    "The team must press the buzzer and submit the answer.",
  ],
}

const q4Content = {
  title: "Find the Error",
  instructions: ["Identify the error(s) in the following C code:"],
  code: `#include <stdio.h>
int main ()
{
    int x= 10
    printf("Value of x is %d\\n ", x);
    return 0;
}`,
}

const q7Content = {
  title: "Decode and Win 🔒",
  instructions: ["Use the Morse code chart above to decode the following sequence:"],
  code: `... -- .- .-.- / -- .. -. .-.. ... / .-- .. -.`,
  codeLarge: true,
}

export default function Home() {
  const [showToast, setShowToast] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [teamName, setTeamName] = useState("")
  const [teamInput, setTeamInput] = useState("")
  const [teamError, setTeamError] = useState(false)
  const [quizDone, setQuizDone] = useState(false)

  const { isBanned, showWarning, countdown, enterFullscreen, handleReenter } =
    useFullscreenGuard(!!teamName && !quizDone, teamName)

  const handleStart = useCallback(() => {
    if (!teamInput.trim()) {
      setTeamError(true)
      return
    }
    setTeamName(teamInput.trim())
    setTeamError(false)
    // request fullscreen on start
    document.documentElement.requestFullscreen?.()
  }, [teamInput])

  const handleSubmit = useCallback((questionNumber: number, answer: string) => {
    console.log(`Question ${questionNumber} submitted:`, answer)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      if (questionNumber < 7) {
        setCurrentQuestion(questionNumber + 1)
      } else {
        setQuizDone(true)
        document.exitFullscreen?.()
      }
    }, 1500)
  }, [])

  const handleTimeUp = useCallback((questionNumber: number) => {
    if (questionNumber < 7) {
      setTimeout(() => setCurrentQuestion(questionNumber + 1), 1000)
    } else {
      setQuizDone(true)
      document.exitFullscreen?.()
    }
  }, [])

  const handleToastClose = useCallback(() => {
    setShowToast(false)
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0b12]">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-purple-600/30 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {!teamName ? (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl">
            <h1 className="mb-2 text-center text-2xl font-bold text-white/90">Welcome</h1>
            <p className="mb-6 text-center text-sm text-white/40">Enter your team name to begin</p>
            <input
              type="text"
              value={teamInput}
              onChange={(e) => { setTeamInput(e.target.value); setTeamError(false) }}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder="Team name..."
              className="mb-3 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white/90 placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            {teamError && <p className="mb-3 text-sm text-red-400">Please enter a team name.</p>}
            <button
              onClick={handleStart}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Start Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto max-w-[1100px] px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-16 text-center">
          <h1 className="mb-4 text-balance bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            Answer. Think. Beat the Timer.
          </h1>
          <p className="text-sm text-purple-400 font-semibold">Team: {teamName}</p>
                </header>

        {/* Question Cards */}
        <section className="space-y-6">
          <QuestionCard
            key={currentQuestion}
            questionNumber={currentQuestion}
            onSubmit={handleSubmit}
            onTimeUp={handleTimeUp}
            image={currentQuestion === 1 ? "/cube-count.png" : currentQuestion === 3 ? "/eye-test.png" : currentQuestion === 5 ? "/bucket-fill.png" : currentQuestion === 6 ? "/pattern-logic.png" : currentQuestion === 7 ? "/morse-code.png" : undefined}
            content={currentQuestion === 2 ? q2Content : currentQuestion === 4 ? q4Content : currentQuestion === 7 ? q7Content : undefined}
            correctAnswer={currentQuestion === 1 ? "51" : currentQuestion === 2 ? "9" : currentQuestion === 3 ? "15" : currentQuestion === 4 ? ["semicolon", ";", "missing ;", "int x= 10;"] : currentQuestion === 5 ? "b" : currentQuestion === 6 ? "14" : currentQuestion === 7 ? "smart minds win" : undefined}
            teamName={teamName}
          />
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-white/30">
            Complete all questions within the time limit
          </p>
          <p className="mt-2 text-xs text-white/40">Developed by Preetam S</p>
        </footer>
      </div>
      )}

      {/* Fullscreen overlays */}
      {isBanned && <BannedScreen />}
      {showWarning && !isBanned && <FullscreenWarning countdown={countdown} onReenter={handleReenter} />}

      {/* Toast Notification */}
      <SubmitToast show={showToast} onClose={handleToastClose} />
    </main>
  )
}
