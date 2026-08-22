"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconLoader2,
} from "@tabler/icons-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <IconCircleCheck className="size-4 text-emerald-400" />,
        info: <IconInfoCircle className="size-4 text-sky-400" />,
        warning: <IconAlertTriangle className="size-4 text-amber-400" />,
        error: <IconAlertOctagon className="size-4 text-rose-400" />,
        loading: <IconLoader2 className="size-4 animate-spin text-indigo-400" />,
      }}
      toastOptions={{
        classNames: {
          toast: "bg-neutral-900 border border-neutral-800 text-white shadow-xl rounded-xl",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
