import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">About APOFF-AI</h1>

      <Card>
        <CardHeader>
          <CardTitle>What is APOFF-AI?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            APOFF-AI (Automated Processing of Legal Documents with AI) is an
            intelligent legal research platform designed to help legal
            professionals discover, analyze, and understand case law more
            efficiently.
          </p>
          <p>
            The platform combines advanced AI technologies including Retrieval
            Augmented Generation (RAG), vector search, and large language models
            to provide deep insights into legal cases.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>AI-powered case breakdown and analysis</li>
            <li>Full-text search across all cases</li>
            <li>Natural language querying with APOFF-AI assistant</li>
            <li>Document ingestion from PDF, URL, or text</li>
            <li>Case saving and note-taking</li>
            <li>Citation tracking and analysis</li>
            <li>Privacy controls for sensitive data</li>
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>Next.js 14 with App Router</li>
            <li>React Server Components</li>
            <li>Prisma ORM with SQLite/PostgreSQL</li>
            <li>OpenAI GPT-4 for AI features</li>
            <li>Vector search with Upstash Redis</li>
            <li>shadcn/ui component library</li>
            <li>TypeScript for type safety</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
