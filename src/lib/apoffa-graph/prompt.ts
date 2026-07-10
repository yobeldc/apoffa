/**
 * LLM prompt templates for APOffa Graph operations.
 */

export function buildEntityExtractionPrompt(text: string): string {
  return `You are a forensic entity extraction system. Analyze the text and extract all relevant entities.

Instructions:
1. Identify people, organizations, locations, emails, phones, IPs, URLs, devices.
2. For each: name, type, confidence (0-1), supporting excerpt.
3. Output JSON array only.

Types: PERSON|EMAIL|PHONE|URL|IP_ADDRESS|MAC_ADDRESS|ORGANIZATION|LOCATION|DEVICE|FILE

Format:
[{"name":"...","type":"...","confidence":0.95,"excerpt":"..."}]

Text:
---
${text.slice(0, 8000)}
---`;
}

export function buildRelationshipPrompt(entities: Array<{ name: string; type: string }>, text: string): string {
  return `Given these entities and source text, identify relationships.

Entities:
${entities.map(e => `- ${e.name} (${e.type})`).join('\n')}

Types: COMMUNICATED|OWN|LOCATED_AT|ACCESSED|RELATED

Format:
[{"source":"...","target":"...","type":"...","confidence":0.85,"excerpt":"..."}]

Source:
---
${text.slice(0, 8000)}
---`;
}

export function buildSummaryPrompt(entities: Array<{ name: string; type: string }>, relationships: Array<{ source: string; target: string; type: string }>): string {
  return `Analyze this entity graph and summarize.

Entities:
${entities.map(e => `- ${e.name} (${e.type})`).join('\n')}

Relationships:
${relationships.map(r => `- ${r.source} --${r.type}--> ${r.target}`).join('\n')}

Provide: overview, central entities, anomalies, next steps.`;
}

export function buildEntityResolutionPrompt(candidates: Array<{ id: string; name: string; type: string }>): string {
  return `Identify duplicate entities among these candidates.

${candidates.map(c => `- ID:${c.id} Name:"${c.name}" Type:${c.type}`).join('\n')}

Format:
[{"canonicalName":"...","entityIds":["..."],"reason":"..."}]`;
}
