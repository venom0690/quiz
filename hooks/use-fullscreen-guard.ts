"use client"

import { useEffect, useState, useCallback, useRef } from "react"

export function useFullscreenGuard(active: boolean, teamName?: string) {
  const [isBanned, setIsBanned] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [showWarning, setShowWarning] = useState(false)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const enterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.()
  }, [])

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  const startCountdown = useCallback(() => {
    setShowWarning(true)
    setCountdown(3)
    clearCountdown()
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown()
          setShowWarning(false)
          setIsBanned(true)
          if (teamName) {
            fetch("/api/banned", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ teamName }),
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearCountdown])

  const handleReenter = useCallback(() => {
    enterFullscreen()
    clearCountdown()
    setShowWarning(false)
    setCountdown(3)
  }, [enterFullscreen, clearCountdown])

  useEffect(() => {
    if (!active) return

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        startCountdown()
      } else {
        clearCountdown()
        setShowWarning(false)
        setCountdown(3)
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      clearCountdown()
    }
  }, [active, startCountdown, clearCountdown])

  return { isBanned, showWarning, countdown, enterFullscreen, handleReenter }
}
