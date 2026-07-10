# Case Detail Page Design

## Overview
The case detail page presents a comprehensive view of a single legal case with AI-powered breakdown, full text, metadata, and related cases.

## Layout
- **Left sidebar**: Case metadata (court, date, judges, parties)
- **Main content**: AI Breakdown, Full Text, Citations tabs
- **Right panel**: Related cases, Save button

## Components
- `CaseDetail`: Main page component
- `CaseBreakdownPanel`: AI-generated breakdown display
- `SaveCaseButton`: Save/unsave toggle

## States
- Loading: Skeleton UI with shimmer effect
- Error: Error state with retry option
- Loaded: Full case view with tabs

## Interactions
- Tab switching between Breakdown, Full Text, Citations
- Save case toggle with optimistic UI
- Copy citation link
- Print case
