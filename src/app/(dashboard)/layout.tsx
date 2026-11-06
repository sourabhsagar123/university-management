import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { ToastProvider } from "@/components/ui/toast"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const initials = session.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50/50">
        <Sidebar
          role={session.role as "ADMIN" | "FACULTY" | "STUDENT"}
          userName={session.name}
          userEmail={session.email}
        />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-gray-500">
                Chandigarh University
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-medium text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded-full">
                {session.role} Portal
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-800">{session.name}</p>
                <p className="text-[10px] text-gray-500">{session.email}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-semibold text-white">
                {initials}
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
