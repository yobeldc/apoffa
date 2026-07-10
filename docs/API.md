# API Documentation

## Authentication

All API endpoints require authentication via Supabase session cookie or Bearer token.

```bash
# Using Bearer token
Authorization: Bearer <supabase-jwt-token>
```

## Cases

### List Cases
```
GET /api/cases?page=1&limit=20&search=keyword
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search query |
| court | string | Filter by court |
| case_type | string | Filter by case type |
| date_from | string | Start date (YYYY-MM-DD) |
| date_to | string | End date (YYYY-MM-DD) |

**Response:**
```json
{
  "cases": [
    {
      "id": "uuid",
      "case_number": "123/K/Pdt.SUS-PHI/2022",
      "title": "Case title",
      "case_date": "2022-06-15",
      "court": "Pengadilan Hubungan Industrial Jakarta",
      "case_type": "Perdata"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Get Case Detail
```
GET /api/cases/:id
```

**Response:**
```json
{
  "id": "uuid",
  "case_number": "123/K/Pdt.SUS-PHI/2022",
  "title": "Case title",
  "full_text": "Full case text...",
  "pdf_url": "https://...",
  "source_url": "https://..."
}
```

### Get Case Breakdown
```
GET /api/cases/:id/breakdown
```

Returns AI-generated case breakdown with key points and legal analysis.

## Search

### Full-text Search
```
GET /api/search?q=query&filters={"court":"Jakarta"}
```

### RAG Query
```
POST /api/rag/query
Content-Type: application/json

{
  "query": "What are the requirements for PHK?",
  "filters": {
    "case_type": "Perdata"
  }
}
```

**Response:**
```json
{
  "answer": "According to Indonesian labor law...",
  "sources": [
    {
      "case_id": "uuid",
      "case_number": "123/K/Pdt.SUS-PHI/2022",
      "title": "Case title",
      "relevance": 0.95
    }
  ]
}
```

## Ingestion

### List Jobs
```
GET /api/ingestion/jobs
```

### Create Job
```
POST /api/ingestion/jobs
Content-Type: application/json

{
  "type": "web_scrape",
  "url": "https://putusan3.mahkamahagung.go.id/...",
  "config": {
    "max_pages": 10
  }
}
```

### Get Job Status
```
GET /api/ingestion/jobs/:id
```

## User Data

### Save Case
```
POST /api/saved
Content-Type: application/json

{
  "case_id": "uuid"
}
```

### List Saved Cases
```
GET /api/saved
```

### Add Note
```
POST /api/notes
Content-Type: application/json

{
  "case_id": "uuid",
  "content": "My note about this case"
}
```

## Apoffa Graph

### Get Dashboard Stats
```
GET /api/apoffa-graph/dashboard
```

### List Judges
```
GET /api/apoffa-graph/judges
```

### List Issues
```
GET /api/apoffa-graph/issues
```

### Get Articles
```
GET /api/apoffa-graph/articles
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

Common status codes:
| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
