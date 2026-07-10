# Dashboard Page Design

## Overview
The dashboard is the main entry point showing key statistics, recent cases, saved cases, and quick actions.

## Layout
- **Header**: Title + date range filter
- **Stats row**: Key metrics tiles
- **Main grid**: Recent cases + Saved cases side by side
- **Bottom**: Quick actions + Search bar

## Components
- `StatTile`: Displays a single metric with trend
- `CaseResultCard`: Compact case preview
- `CommandPalette`: Global search + actions
- `GlobalSearch`: Full search interface

## States
- Empty: No cases yet, show onboarding
- Loading: Skeleton layout
- Loaded: Full dashboard with data
- Error: Error boundary fallback

## Interactions
- Search opens command palette
- Click case to navigate to detail
- Quick action buttons for common tasks
