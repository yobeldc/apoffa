# Ingestion Page Design

## Overview
The ingestion page manages importing legal cases from various sources with progress tracking and job management.

## Layout
- **Header**: Title + new ingestion button
- **Jobs list**: Table of ingestion jobs with status
- **Detail panel**: Selected job details and logs
- **Import form**: File/text/URL input interface

## Components
- `IngestionView`: Main ingestion interface
- `JobLogsView`: Real-time log display
- `FileImportPanel`: File upload and preview
- `DataQualityBadge`: Quality indicator for cases

## States
- No jobs: Empty state with import prompt
- Jobs list: Table with status badges
- Running: Progress bars and live logs
- Completed: Summary with imported cases
- Error: Error details and retry options

## Interactions
- Create new ingestion job
- Upload PDF/text files
- Monitor progress in real-time
- View imported cases
- Re-run failed jobs
