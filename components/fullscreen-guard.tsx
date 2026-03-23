"use client"

interface FullscreenWarningProps {
  countdown: number
  onReenter: () => void
}

export function FullscreenWarning({ countdown, onReenter }: FullscreenWarningProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-center">
        <p className="text-5xl font-bold text-yellow-400 mb-4">{countdown}</p>
        <h2 className="text-xl font-bold text-white/90 mb-2">You left fullscreen!</h2>
        <p className="text-sm text-white/50 mb-6">
          Return to fullscreen now or you will be banned.
        </p>
        <button
          onClick={onReenter}
          className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 py-2.5 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
        >
          Re-enter Fullscreen
        </button>
      </div>
    </div>
  )
}

export function BannedScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center">
        <p className="text-6xl mb-4">🚫</p>
        <h2 className="text-3xl font-bold text-red-500 mb-3">You have been banned</h2>
        <p className="text-white/40 text-sm">You exited fullscreen mode during the quiz.</p>
      </div>
    </div>
  )
}
