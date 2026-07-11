/"use client"

import { useParams } from "next/navigation"

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Job Detail</h1>
      <p className="text-muted-foreground mt-2">Job ID: {jobId}</p>
    </div>
  )
}
