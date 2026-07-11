/"use client"

import { useState } from "react"

export default function SearchPage() {
  const [query, setQuery] = useState("")

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search Documents</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full px-4 py-2 rounded-md border bg-background"
      />
    </div>
  )
}
