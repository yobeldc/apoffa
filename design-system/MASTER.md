# APOffa Design System

## Overview
The APOffa Design System provides guidelines, components, and patterns for building consistent, accessible, and performant UIs.

## Principles
1. **Clarity First** - Every element serves a purpose.
2. **Accessible by Default** - WCAG 2.1 AA compliance minimum.
3. **Performance Matters** - Lightweight and fast components.
4. **Consistent but Flexible** - Unified patterns with contextual adaptation.

## Color Palette

### Primary
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary-50` | `#eff6ff` | Backgrounds |
| `--primary-500` | `#3b82f6` | Primary actions |
| `--primary-600` | `#2563eb` | Buttons, links |
| `--primary-900` | `#1e3a8a` | Headings |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#10b981` | Success |
| `--warning` | `#f59e0b` | Warning |
| `--destructive` | `#ef4444` | Error |

### Neutral
| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#ffffff` | Page bg |
| `--foreground` | `#0f172a` | Primary text |
| `--muted` | `#f1f5f9` | Muted bg |
| `--border` | `#e2e8f0` | Borders |

## Typography
- Font: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Scale: xs(0.75rem) | sm(0.875rem) | base(1rem) | lg(1.125rem) | xl(1.25rem) | 2xl(1.5rem) | 3xl(1.875rem) | 4xl(2.25rem)

## Spacing
1 = 0.25rem, 2 = 0.5rem, 4 = 1rem, 6 = 1.5rem, 8 = 2rem, 12 = 3rem, 16 = 4rem

## Border Radius
sm = 0.125rem, md = 0.375rem, lg = 0.5rem, xl = 0.75rem, full = 9999px

## Shadows
sm = 0 1px 2px 0 rgb(0 0 0 / 0.05), md = 0 4px 6px -1px rgb(0 0 0 / 0.1), lg = 0 10px 15px -3px

## Breakpoints
sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

## Dark Mode
| Token | Light | Dark |
|-------|-------|------|
| --background | #ffffff | #0f172a |
| --foreground | #0f172a | #f8fafc |
| --card | #ffffff | #1e293b |
| --border | #e2e8f0 | #334155 |

## File Organization
```
design-system/
├── MASTER.md
├── tokens.json
├── components/
├── patterns/
└── assets/
```
