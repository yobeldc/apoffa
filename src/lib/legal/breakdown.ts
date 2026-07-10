// src/lib/legal/breakdown.ts
// AI-powered legal case breakdown generation

import { prisma } from '../db';
import { serialize } from '../serialize';
import { env } from '../env';

export interface CaseBreakdown {
  facts: string[];
  issues: string[];
  holdings: string[];
  reasoning: string[];
  dissent: string[];
  significance: string;
}

export async function generateBreakdown(caseId: string): Promise<CaseBreakdown> {
  const case_ = await prisma.case.findUnique({
    where: { id: caseId },
    include: { paragraphs: true },
  });

  if (!case_) {
    throw new Error(`Case not found: ${caseId}`);
  }

  const fullText = [
    case_.title,
    case_.court,
    case_.judges,
    case_.parties,
    case_.summary,
    ...case_.paragraphs.map((p) => p.text),
  ]
    .filter(Boolean)
    .join('\n\n');

  // Call LLM to generate breakdown
  const breakdown = await callLLMForBreakdown(fullText);

  // Save to database
  await prisma.caseBreakdown.upsert({
    where: { caseId },
    create: {
      caseId,
      facts: JSON.stringify(breakdown.facts),
      issues: JSON.stringify(breakdown.issues),
      holdings: JSON.stringify(breakdown.holdings),
      reasoning: JSON.stringify(breakdown.reasoning),
      dissent: JSON.stringify(breakdown.dissent),
      significance: breakdown.significance,
      model: 'gpt-4',
    },
    update: {
      facts: JSON.stringify(breakdown.facts),
      issues: JSON.stringify(breakdown.issues),
      holdings: JSON.stringify(breakdown.holdings),
      reasoning: JSON.stringify(breakdown.reasoning),
      dissent: JSON.stringify(breakdown.dissent),
      significance: breakdown.significance,
      model: 'gpt-4',
      generatedAt: new Date(),
    },
  });

  return breakdown;
}

async function callLLMForBreakdown(caseText: string): Promise<CaseBreakdown> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a legal analysis AI. Analyze the following legal case and provide a structured breakdown. 
Respond in JSON format with these fields: facts (array of strings), issues (array of strings), holdings (array of strings), reasoning (array of strings), dissent (array of strings), significance (string).`,
        },
        {
          role: 'user',
          content: caseText.slice(0, 12000),
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  return {
    facts: parsed.facts || [],
    issues: parsed.issues || [],
    holdings: parsed.holdings || [],
    reasoning: parsed.reasoning || [],
    dissent: parsed.dissent || [],
    significance: parsed.significance || '',
  };
}

export async function getBreakdown(caseId: string): Promise<CaseBreakdown | null> {
  const breakdown = await prisma.caseBreakdown.findUnique({
    where: { caseId },
  });

  if (!breakdown) return null;

  return {
    facts: JSON.parse(breakdown.facts || '[]'),
    issues: JSON.parse(breakdown.issues || '[]'),
    holdings: JSON.parse(breakdown.holdings || '[]'),
    reasoning: JSON.parse(breakdown.reasoning || '[]'),
    dissent: JSON.parse(breakdown.dissent || '[]'),
    significance: breakdown.significance || '',
  };
}
