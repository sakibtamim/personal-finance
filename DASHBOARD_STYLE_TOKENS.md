# Dashboard Style Token Map

This file defines the visual baseline for dashboard UI work.
Use it as a source of truth before adding or changing styles.

## Typography

- Section title:
  - Class: `text-[1.75rem] md:text-[2rem] font-semibold tracking-tight`
  - Usage: page/section headings only
- Section description:
  - Class: `text-sm leading-relaxed text-muted-foreground`
  - Usage: one short supporting paragraph below title
- Card micro-label:
  - Class: `text-[11px] font-medium uppercase tracking-wide text-muted-foreground`
  - Usage: stat labels, compact metadata labels
- Body value text:
  - Class: `text-sm font-semibold` (or `font-medium` when lower emphasis)
  - Usage: profile values, compact content
- Stat value text:
  - Class: `text-2xl md:text-[1.75rem] font-semibold leading-tight`
  - Usage: KPI/stat values only
- Topbar action buttons:
  - Class hint: `text-[13px]`

## Spacing

- Dashboard shell main padding:
  - Class: `px-4 py-5 md:px-8 md:py-7`
- Section wrapper spacing:
  - Class: `space-y-4 md:space-y-6`
- Standard card content padding:
  - Class: `p-4 md:p-5`
- Compact row/action gaps:
  - Small controls: `gap-1.5` to `gap-2`
  - Content groups: `gap-3` to `gap-4`

## Radii

- Primary containers: `rounded-2xl`
- Secondary cards/tiles: `rounded-xl`
- Chips/small controls: `rounded-lg`

## Borders and Surfaces

- Primary card border contrast:
  - Class: `border-border/60`
- Secondary card border contrast:
  - Class: `border-border/60` to `border-border/80`
- Primary dashboard surfaces:
  - Class: `bg-card/95`
- Secondary stat/list surfaces:
  - Class: `bg-background/70`
- Dashed empty-state panels:
  - Class: `border-dashed bg-muted/20`

## Feedback States

- Error banner (soft):
  - Class: `border-destructive/25 bg-destructive/8 text-destructive/90`
- Success banner (soft):
  - Class: `border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300`
- Feedback motion:
  - Class: `animate-in fade-in-0 slide-in-from-bottom-1 duration-200`

## Buttons

- Primary action: default variant
- Secondary action: `variant="secondary"`
- Utility/low emphasis: `variant="outline"`
- Destructive actions: `variant="destructive"`
- All dashboard action buttons should include disabled + loading text during async actions.

## Responsive Rules

- Sidebar hidden below `md`; use top nav chips on mobile.
- Dense tabular data:
  - Mobile: stacked cards
  - Desktop: table (`md:table`)
- Keep touch targets at least `h-9` to `h-10` for action controls.

## Consistency Rules

- Do not introduce new ad-hoc font sizes unless required.
- Reuse existing class combinations from this file before adding new ones.
- Keep one visual hierarchy:
  - Title > description > micro-label > value > helper text.
- Prefer subtle contrast changes over saturated color blocks.
