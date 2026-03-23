"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SubmitToastProps {
  show: boolean
  onClose: () => void
}

export function SubmitToast({ show, onClose }: SubmitToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Trigger animation after a small delay to ensure the element is rendered
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })

      // Auto-hide after 2 seconds
      const hideTimer = setTimeout(() => {
        setIsAnimating(false)
        // Wait for animation to complete before hiding
        setTimeout(() => {
          setIsVisible(false)
          onClose()
        }, 300)
      }, 2000)

      return () => clearTimeout(hideTimer)
    }
  }, [show, onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.08] px-5 py-3.5 shadow-[0_8px_32px_rgba(124,58,237,0.25)] backdrop-blur-xl transition-all duration-300",
        isAnimating
          ? "translate-y-0 scale-100 opacity-100"
          : "-translate-y-4 scale-95 opacity-0"
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-500">
        <svg
          className="h-3.5 w-3.5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-white/90">
        Submitted Successfully
      </span>
    </div>
  )
}
