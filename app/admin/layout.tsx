import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cosmic Dev Admin",
  description: "Admin Dashboard",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
