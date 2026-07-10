# Search Page Design

## Overview
The search page provides full-text search across all legal cases with filters, sorting, and AI-powered RAG answers.

## Layout
- **Search bar**: Full-width with filters
- **Results**: List of case cards with highlighting
- **AI Answer**: RAG-generated answer panel (when applicable)
- **Filters sidebar**: Date, court, case type filters

## Components
- `SearchView`: Main search interface
- `CaseResultCard`: Search result with highlighting
- `AskApofPanel`: AI question/answer interface
- `DataQualityBadge`: Quality indicator

## States
- Initial: Search prompt with suggestions
- Loading: Skeleton results
- Results: Case list with pagination
- AI Answer: RAG response alongside results
- No results: Empty state with suggestions

## Interactions
- Type to search with debounce
- Filter by date range, court, case type
- Sort by relevance, date, court
- Ask AI for case summaries
- Click result to view case detail
