// src/lib/summarize.ts
// AI-powered case summarization

import { env } from './env';

export interface CaseSummary {
  summary: string;
  keyPoints: string[];
  holdings: string[];
}

export async function summarizeCase(caseText: string): Promise<CaseSummary> {
  // In production, this would call OpenAI or Anthropic API
  // For now, return a placeholder
  
  console.log('Summarizing case...');
  
  return {
    summary: 'Case summary will be generated using AI.',
    keyPoints: [
      'Key point extraction requires AI integration',
      'Configure OpenAI API key in environment variables',
    ],
    holdings: [
      'Holdings extraction will be available after AI setup',
    ],
  };
}

export async function summarizeWithOpenAI(caseText: string): Promise<string> {
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
          content: 'You are a legal assistant. Summarize the following legal case concisely.',
        },
        {
          role: 'user',
          content: caseText.slice(0, 8000), // Limit input size
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
