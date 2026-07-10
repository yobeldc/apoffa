/**
 * Case Analysis Job Handler
 *
 * Generates AI-powered case analysis:
 *   1. Fetch case text
 *   2. Call LLM API for analysis
 *   3. Parse and store results
 */

/**
 * Handle a case analysis job
 * @param {Object} payload - Job payload
 * @param {Object} context - { pool, supabase }
 */
async function handleCaseAnalysis(payload, context) {
  const { pool } = context;
  const { case_id } = payload;

  const client = await pool.connect();
  try {
    // Fetch case
    const { rows: [caseData] } = await client.query(`
      SELECT id, title, full_text, case_number, case_date, court, judge_panel
      FROM case_decisions WHERE id = $1
    `, [case_id]);

    if (!caseData) {
      throw new Error(`Case not found: ${case_id}`);
    }

    console.log(`[Analysis] Analyzing case: ${caseData.case_number}`);

    // Generate analysis via LLM
    const analysis = await generateCaseAnalysis(caseData);

    // Store analysis
    await client.query(`
      INSERT INTO case_analyses (case_id, summary, key_issues, legal_basis, decision_rationale, judge_analysis, confidence, model_version)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (case_id) DO UPDATE SET
        summary = EXCLUDED.summary,
        key_issues = EXCLUDED.key_issues,
        legal_basis = EXCLUDED.legal_basis,
        decision_rationale = EXCLUDED.decision_rationale,
        judge_analysis = EXCLUDED.judge_analysis,
        confidence = EXCLUDED.confidence,
        model_version = EXCLUDED.model_version,
        updated_at = now()
    `, [
      case_id,
      analysis.summary,
      JSON.stringify(analysis.keyIssues),
      JSON.stringify(analysis.legalBasis),
      analysis.decisionRationale,
      JSON.stringify(analysis.judgeAnalysis),
      analysis.confidence,
      analysis.modelVersion,
    ]);

    console.log(`[Analysis] Completed: ${caseData.case_number}`);
  } finally {
    client.release();
  }
}

/**
 * Generate case analysis via LLM
 */
async function generateCaseAnalysis(caseData) {
  const provider = process.env.RAG_LLM_PROVIDER || 'ollama';
  const model = process.env.RAG_LLM_MODEL || 'qwen3:8b';
  const baseUrl = process.env.RAG_LLM_BASE_URL || 'http://localhost:11434';

  const prompt = `Analyze the following Indonesian court case and provide a structured analysis:

Case Number: ${caseData.case_number}
Title: ${caseData.title}
Court: ${caseData.court}
Date: ${caseData.case_date}
Judges: ${caseData.judge_panel}

Full Text:
${caseData.full_text.substring(0, 8000)}

Provide analysis in JSON format:
{
  "summary": "Brief case summary (2-3 sentences)",
  "keyIssues": ["Issue 1", "Issue 2"],
  "legalBasis": ["Law 1", "Law 2"],
  "decisionRationale": "Why the court decided this way",
  "judgeAnalysis": { "judgeName": { "caseCount": 10, "tendency": "description" } },
  "confidence": 0.85
}`;

  if (provider === 'ollama') {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.response);

    return {
      summary: result.summary || '',
      keyIssues: result.keyIssues || [],
      legalBasis: result.legalBasis || [],
      decisionRationale: result.decisionRationale || '',
      judgeAnalysis: result.judgeAnalysis || {},
      confidence: result.confidence || 0.5,
      modelVersion: `${provider}/${model}`,
    };
  }

  // Fallback: return mock analysis
  return {
    summary: `Case ${caseData.case_number} analysis pending.`,
    keyIssues: [],
    legalBasis: [],
    decisionRationale: '',
    judgeAnalysis: {},
    confidence: 0,
    modelVersion: 'mock',
  };
}

module.exports = { handleCaseAnalysis };
