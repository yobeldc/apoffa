// src/lib/rag/llm.ts
// LLM integration for RAG answer generation

import { env } from '../env';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  answer: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateAnswer(
  question: string,
  context: string[]
): Promise<LLMResponse> {
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: `You are a legal research assistant. Answer questions based on the provided legal case context. 
Be precise, cite specific cases when possible, and acknowledge if the context doesn't contain enough information.
Format your response with clear sections and bullet points where appropriate.`,
    },
    {
      role: 'user',
      content: `Context:\n${context.join('\n\n---\n\n')}\n\nQuestion: ${question}`,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    answer: data.choices[0].message.content,
    model: data.model,
    usage: data.usage,
  };
}

export async function streamAnswer(
  question: string,
  context: string[],
  onChunk: (chunk: string) => void
): Promise<void> {
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: 'You are a legal research assistant. Answer based on provided context.',
    },
    {
      role: 'user',
      content: `Context:\n${context.join('\n\n---\n\n')}\n\nQuestion: ${question}`,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      max_tokens: 1500,
      temperature: 0.3,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM streaming error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter((line) => line.trim());

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }
}
