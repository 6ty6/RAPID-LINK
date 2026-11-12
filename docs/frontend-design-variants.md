# RapidLink frontend design variants

**Baseline branch:** `cms-restructure`  
**Production branch:** `main`  
**Prepared:** 12 November 2026

## Purpose

Create three visually distinct frontend concepts for management comparison
without changing the current production website, shared business content,
Supabase security model or approved functionality.

## Isolated design branches

| Branch | Local worktree | Direction |
|---|---|---|
| `design/corporate-trust` | `.worktrees/corporate-trust` | Formal, structured and institution-led |
| `design/human-centred` | `.worktrees/human-centred` | Customer stories, goals and approachable service journeys |
| `design/digital-first` | `.worktrees/digital-first` | Compact, modern and digital-channel focused |

All three branches start from the same tagged baseline. They must not be merged
into `main` until a concept is selected, tested and approved.

## Shared items that must not diverge

- approved wording, products, images and public records;
- content-access services and Supabase configuration;
- authentication, Row Level Security and staff-management behaviour;
- calculator formula, loan rates and financial disclosures;
- public routes, canonical URLs and structured metadata;
- external-link safety, maps and document behaviour;
- accessibility requirements and reduced-motion support; and
- the official logo colours `#0831ff` and `#ff7400`.

The design variants may introduce different supporting neutrals and different
proportions of the two official colours, but must not replace the official blue
and orange or reduce text contrast.

## Initial comparison scope

Build only enough of each direction to make a reliable decision:

1. global announcement bar, desktop/mobile header and navigation;
2. homepage hero and main homepage sections;
3. one savings product page;
4. one loan product page, without changing calculations or rates;
5. Institutional Profile;
6. News listing;
7. Contact page; and
8. global footer.

After management selects one direction, complete the remaining pages on the
selected branch. Do not build every internal page three times before selection.

## Preview deployment rules

- Production continues to deploy from `main` only.
- Each design branch receives a separate Render preview service or branch
  preview URL.
- Set `VITE_INDEXABLE=false` and `X-Robots-Tag: noindex, nofollow` on every
  design preview.
- Use the same public content source so comparisons are based on design rather
  than different wording.
- Store deployment values in Render and local `.env.local` files; never commit
  credentials.
- Do not run database migrations for a visual concept.

## Acceptance checklist

Each concept must pass the existing application, build and pre-render tests and
must be reviewed at desktop and mobile widths. Management comparison should
score brand fit, clarity, accessibility, task completion, performance,
institutional credibility, marketing strength and maintainability.

## Merge strategy

Once a direction is approved, record the decision, archive screenshots of all
three previews, merge only the selected branch back into `cms-restructure`, run
the complete verification suite and seek approval before merging to `main`.
