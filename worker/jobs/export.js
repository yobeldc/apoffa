/**
 * Export Job Handler
 *
 * Generates export files:
 *   - CSV: Case data for spreadsheet analysis
 *   - JSON: Full case data with metadata
 *   - PDF: Formatted case reports
 */

/**
 * Handle an export job
 * @param {Object} payload - Job payload
 * @param {Object} context - { pool, supabase }
 */
async function handleExportJob(payload, context) {
  const { pool, supabase } = context;
  const { format, filters, user_id } = payload;

  console.log(`[Export] Generating ${format} export`);

  const client = await pool.connect();
  try {
    // Build query based on filters
    let query = 'SELECT * FROM case_decisions';
    const params = [];
    const conditions = [];

    if (filters?.case_type) {
      params.push(filters.case_type);
      conditions.push(`case_type = $${params.length}`);
    }
    if (filters?.court) {
      params.push(filters.court);
      conditions.push(`court = $${params.length}`);
    }
    if (filters?.date_from) {
      params.push(filters.date_from);
      conditions.push(`case_date >= $${params.length}`);
    }
    if (filters?.date_to) {
      params.push(filters.date_to);
      conditions.push(`case_date <= $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY case_date DESC';

    if (filters?.limit) {
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
    }

    const { rows: cases } = await client.query(query, params);

    // Generate export file
    let fileContent;
    let fileName;
    let contentType;

    switch (format) {
      case 'csv':
        fileContent = generateCsv(cases);
        fileName = `apoffa-export-${Date.now()}.csv`;
        contentType = 'text/csv';
        break;
      case 'json':
        fileContent = JSON.stringify(cases, null, 2);
        fileName = `apoffa-export-${Date.now()}.json`;
        contentType = 'application/json';
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('exports')
      .upload(fileName, Buffer.from(fileContent), {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('exports')
      .getPublicUrl(fileName);

    console.log(`[Export] Completed: ${fileName} (${cases.length} cases)`);

    return {
      fileName,
      publicUrl,
      caseCount: cases.length,
    };
  } finally {
    client.release();
  }
}

/**
 * Generate CSV from cases
 */
function generateCsv(cases) {
  const headers = ['case_number', 'title', 'case_date', 'case_type', 'court', 'judge_panel', 'decision', 'source_url'];
  const rows = cases.map(c => [
    c.case_number,
    `"${(c.title || '').replace(/"/g, '""')}"`,
    c.case_date,
    c.case_type,
    c.court,
    `"${(c.judge_panel || '').replace(/"/g, '""')}"`,
    `"${(c.decision || '').replace(/"/g, '""').substring(0, 500)}"`,
    c.source_url,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

module.exports = { handleExportJob };
