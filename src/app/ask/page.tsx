/"use client"

import { useState } from "react"

export default function AskPage() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAnswer("Thinking...")
    // TODO: Integrate with RAG API
    setAnswer("RAG integration coming soon.")
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Tanya Putusan (RAG)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Tanyakan sesuatu tentang putusan pengadilan..."
          rows={3}
          className="w-full px-4 py-2 rounded-md border bg-background"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium
                     hover:bg-primary/90 disabled:opacity-50"
          disabled={!question.trim()}
        >
          Ask
        </button>
      </form>

      {answer && (
        <div className="p-4 rounded-lg border bg-muted/50">
          <p className="whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  )
}
