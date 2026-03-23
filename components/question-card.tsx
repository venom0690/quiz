"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

interface QuestionContent {
  title: string
  tiles?: string[]
  instructions?: string[]
  code?: string
  codeLarge?: boolean
}

interface QuestionCardProps {
  questionNumber: number
  onSubmit: (questionNumber: number, answer: string) => void
  onTimeUp?: (questionNumber: number) => void
  image?: string
  content?: QuestionContent
  correctAnswer?: string | string[]
  teamName?: string
}

export function QuestionCard({ questionNumber, onSubmit, onTimeUp, image, content, correctAnswer, teamName }: QuestionCardProps) {
  const [timeLeft, setTimeLeft] = useState(300)
  const [isTimerStarted, setIsTimerStarted] = useState(true)
  const [isTimerEnded, setIsTimerEnded] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [answer, setAnswer] = useState("")
  const [isWrongAnswer, setIsWrongAnswer] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const getTimerColor = useCallback((seconds: number) => {
    if (seconds > 180) return "text-green-500" // > 3 min: green
    if (seconds > 60) return "text-orange-500" // 1-3 min: orange
    return "text-red-500" // < 1 min: red
  }, [])

  const handleStartTimer = useCallback(() => {
    if (isTimerStarted || isSubmitted) return
    startTimeRef.current = Date.now()
    setIsTimerStarted(true)
  }, [isTimerStarted, isSubmitted])
  const handleSubmit = useCallback(() => {
    if (isSubmitted) return
    if (correctAnswer) {
      const normalized = answer.trim().toLowerCase()
      const accepted = Array.isArray(correctAnswer)
        ? correctAnswer.map((a) => a.trim().toLowerCase())
        : [correctAnswer.trim().toLowerCase()]
      if (!accepted.some((a) => normalized.includes(a))) {
        setIsWrongAnswer(true)
        setTimeout(() => setIsWrongAnswer(false), 2000)
        return
      }
    }
    setIsSubmitted(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamName: teamName || "Unknown",
        questionNumber,
        answer,
        timeTaken,
        submittedAt: new Date().toISOString(),
      }),
    })
    onSubmit(questionNumber, answer)
  }, [isSubmitted, answer, questionNumber, onSubmit, correctAnswer])

  useEffect(() => {
    if (isTimerStarted && !isTimerEnded && !isSubmitted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerEnded(true)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }
            onTimeUp?.(questionNumber)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTimerStarted, isTimerEnded, isSubmitted])

  const isInputDisabled = isSubmitted || isTimerEnded

  return (
    <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:shadow-[0_8px_32px_rgba(124,58,237,0.15)]">
      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-white/90">
            Q{questionNumber}
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "font-mono text-2xl font-bold tabular-nums transition-colors duration-300",
                isTimerEnded ? "text-red-500" : getTimerColor(timeLeft)
              )}
            >
              {isTimerEnded ? "Time's up!" : formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Question Content */}
        {content && (
          <div className="mb-5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-4">
            <p className="text-base font-semibold text-white/90">{content.title}</p>

            {content.tiles && (
              <div className="flex flex-wrap gap-2">
                {content.tiles.map((tile) => (
                  <span
                    key={tile}
                    className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 font-mono text-lg font-bold text-purple-300"
                  >
                    {tile}
                  </span>
                ))}
              </div>
            )}

            {content.instructions && (
              <ul className="space-y-1.5">
                {content.instructions.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-white/60">
                    <span className="mt-0.5 shrink-0 text-purple-400">➢</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            )}

            {content.code && (
              <pre className={cn(
                "overflow-x-auto rounded-lg border border-white/[0.08] bg-black/40 p-4 font-mono leading-relaxed text-green-400",
                content.codeLarge ? "text-2xl tracking-widest" : "text-sm"
              )}>
                <code>{content.code}</code>
              </pre>
            )}
          </div>
        )}

        {/* Question Image */}
        {image && (
          <div className="mb-5">
            <img
              src={image}
              alt={`Question ${questionNumber} illustration`}
              className="rounded-xl border border-white/[0.08] w-full object-contain max-h-72"
            />
          </div>
        )}

        {/* Input */}
        <div className="mb-5">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isInputDisabled}
            placeholder="Enter your answer here..."
            className={cn(
              "min-h-[100px] w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white/90 placeholder:text-white/30 transition-all duration-300",
              "focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20",
              isWrongAnswer && "border-red-500/60 ring-2 ring-red-500/20",
              isInputDisabled && "cursor-not-allowed opacity-50"
            )}
          />
          {isWrongAnswer && (
            <p className="mt-2 text-sm text-red-400">Incorrect answer, try again.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <span className={cn(
            "rounded-xl px-5 py-2.5 text-sm font-semibold",
            isTimerEnded ? "text-red-400" : "text-green-400"
          )}>
            {isTimerEnded ? "Time's up!" : "⏱ Timer Running"}
          </span>

          <button
            onClick={handleSubmit}
            disabled={isSubmitted || isTimerEnded}
            className={cn(
              "relative overflow-hidden rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-sm font-semibold text-purple-300 transition-all duration-300",
              "hover:scale-[1.02] hover:border-purple-500/50 hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]",
              "active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            )}
          >
            {isSubmitted ? "Submitted ✓" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}
