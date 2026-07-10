// src/lib/rag/verify.ts
// RAG answer verification and hallucination detection

export interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  issues: string[];
  checkedClaims: Array<{
    claim: string;
    supported: boolean;
    source?: string;
  }>;
}

export function verifyAnswer(
  answer: string,
  sources: Array<{ text: string; caseId: string }>
): VerificationResult {
  const issues: string[] = [];
  const checkedClaims: VerificationResult['checkedClaims'] = [];

  // Extract key claims from answer (sentences that cite specific cases)
  const claims = extractClaims(answer);

  for (const claim of claims) {
    const supported = checkClaimAgainstSources(claim, sources);
    checkedClaims.push({
      claim,
      supported,
      source: supported ? findSupportingSource(claim, sources) : undefined,
    });

    if (!supported) {
      issues.push(`Claim may not be supported by sources: "${claim.slice(0, 100)}..."`);
    }
  }

  // Check for specific case name mentions
  const mentionedCases = extractCaseNames(answer);
  const sourceCaseIds = new Set(sources.map((s) => s.caseId));

  // Calculate confidence
  const totalClaims = checkedClaims.length || 1;
  const supportedClaims = checkedClaims.filter((c) => c.supported).length;
  const confidence = supportedClaims / totalClaims;

  return {
    isVerified: confidence > 0.7 && issues.length === 0,
    confidence,
    issues,
    checkedClaims,
  };
}

function extractClaims(answer: string): string[] {
  // Split into sentences and filter for claims (statements with citations or specific facts)
  const sentences = answer.match(/[^.!?]+[.!?]+/g) || [];
  return sentences
    .map((s) => s.trim())
    .filter((s) => s.length > 20); // Only substantial sentences
}

function checkClaimAgainstSources(
  claim: string,
  sources: Array<{ text: string }>
): boolean {
  const claimLower = claim.toLowerCase();
  
  // Check if key terms from claim appear in any source
  const keyTerms = claimLower
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .filter((w) => !['about', 'after', 'before', 'being', 'having'].includes(w));

  if (keyTerms.length === 0) return true; // No specific terms to check

  for (const source of sources) {
    const sourceLower = source.text.toLowerCase();
    const matches = keyTerms.filter((term) => sourceLower.includes(term)).length;
    
    if (matches / keyTerms.length > 0.5) {
      return true;
    }
  }

  return false;
}

function findSupportingSource(
  claim: string,
  sources: Array<{ text: string; caseId: string }>
): string {
  const claimLower = claim.toLowerCase();
  
  for (const source of sources) {
    const sourceLower = source.text.toLowerCase();
    if (sourceLower.includes(claimLower.slice(0, 50))) {
      return source.caseId;
    }
  }

  return sources[0]?.caseId || 'unknown';
}

function extractCaseNames(answer: string): string[] {
  // Simple regex to match case citations like "Smith v. Jones" or "Regina v. Doe"
  const casePattern = /\b[A-Z][a-zA-Z]+\s+v\.\s+[A-Z][a-zA-Z]+\b/g;
  return answer.match(casePattern) || [];
}
