"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ToastVariant = "default" | "success" | "error"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (options: Omit<Toast, "id">) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
)

function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (options: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { ...options, id }
      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        removeToast(id)
      }, 4000)
    },
    [removeToast]
  )

  const contextValue = React.useMemo(() => ({ toast }), [toast])

  const borderColorMap: Record<ToastVariant, string> = {
    default: "border-l-[#1e3a5f]",
    success: "border-l-emerald-500",
    error: "border-l-red-500",
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "relative rounded-lg border border-gray-200 bg-white p-4 shadow-lg border-l-4 animate-in slide-in-from-right-full fade-in duration-300",
              borderColorMap[t.variant || "default"]
            )}
          >
            <button
              onClick={() => removeToast(t.id)}
              className="absolute top-2 right-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
              <span className="sr-only">Close</span>
            </button>
            <div className="pr-4">
              <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              {t.description && (
                <p className="mt-1 text-sm text-gray-500">{t.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastProvider, useToast }
export type { Toast, ToastVariant }
