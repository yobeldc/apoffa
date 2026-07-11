/import { ReactNode } from "react"

/**
 * Admin Layout
 * Protected layout for admin routes.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30 p-4">
        <nav className="space-y-2">
          <a href="/admin" className="block px-3 py-2 rounded-md hover:bg-muted">Dashboard</a>
          <a href="/admin/users" className="block px-3 py-2 rounded-md hover:bg-muted">Users</a>
          <a href="/admin/documents" className="block px-3 py-2 rounded-md hover:bg-muted">Documents</a>
          <a href="/admin/settings" className="block px-3 py-2 rounded-md hover:bg-muted">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
