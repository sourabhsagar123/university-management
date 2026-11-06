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

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50/50">
        <Sidebar
          role={session.role as "ADMIN" | "FACULTY" | "STUDENT"}
          userName={session.name}
          userEmail={session.email}
        />
        <main className="flex-1 ml-64">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ToastProvider>
  )
}
