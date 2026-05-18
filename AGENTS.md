# AI UI Encapsulation Rules

## Purpose
Keep Tailwind and `shadcn/ui` maintainable by preserving a strict UI boundary.

## Primary Rule
Raw Tailwind utility classes belong only in `src/components/ui/**`.
Application and feature files must consume semantic UI components, layout primitives, and variant APIs instead of embedding utility strings.

## App Router Architecture Rules
- Default to Server Components in `src/app/**`.
- `page.tsx`, `layout.tsx`, and route-level composition should stay server-side unless they require browser-only APIs or live client interaction.
- Initial data fetching must happen on the server whenever the data can be loaded during render.
- Prefer passing server-fetched data into small client islands instead of making the whole page client-side.
- Use `"use client"` only when the component needs browser APIs such as `window`, `document`, `navigator`, file inputs, media devices, clipboard, timers, or client-only hooks like `useState`, `useEffect`, and `useRef`.
- If a page needs polling, uploads, optimistic UI, or event-driven local state, isolate that behavior into the smallest practical client component.
- Do not move fetch logic to the client by default. Client-side fetching is the exception and must be justified by live updates, browser-only context, or user-triggered interactions.
- When reviewing or refactoring a page, first ask whether the server can own the initial fetch and static shell before introducing or keeping `"use client"`.

## Layer Boundaries
- `src/components/ui/**` owns Tailwind classes, `cva` variants, slots, tokens, typography, colors, radius, borders, shadows, and interactive states.
- `src/components/ui/layout/**` owns layout primitives such as `Stack`, `Inline`, `Cluster`, `Grid`, `Container`, and `Section`.
- `src/app/**`, `src/components/app/**`, and `src/components/questions/**` may compose UI primitives and pass semantic props, but must not introduce raw Tailwind classes.
- Feature files must use layout primitives for composition instead of `flex`, `grid`, `gap`, `space-*`, `container`, `mx-auto`, or width and height utility classes.
- Layout primitives may accept only structural props such as `as`, `gap`, `align`, `justify`, `wrap`, `columns`, `width`, and `height`.
- Padding is part of the component's visual API and stays in `src/components/ui/**`.
- Margin is a layout concern and should usually be expressed by the parent layout primitive through `gap`, `Stack`, `Inline`, `Grid`, `Container`, or `Section`, not by per-feature raw classes.
- Visual styling such as colors, typography, backgrounds, borders, shadows, paddings, radii, rings, and interactive states stays in `src/components/ui/**`.

## Touched File Rule
When you touch a file, you own that file's compliance with this rule.
If the touched file contains raw Tailwind classes, refactor that same file as part of the change.
Preserve behavior and avoid visual redesign unless the task explicitly requires it.

## Scope Control
- Keep the cleanup local to the touched file.
- Do not start repo-wide style migrations.
- Do not modify unrelated files for consistency only.
- If compliance requires shared styling or layout composition, make the smallest possible change in `src/components/ui/**` and update only the touched consumer.

## Extraction Triggers
Extract or extend a UI primitive when any of these are true:
- A `className` contains more than 8 utilities.
- The same utility combination appears twice.
- A feature file needs layout utilities such as `flex`, `grid`, `gap`, `space-*`, `container`, `mx-auto`, or width and height classes.
- A feature file needs `bg-*`, `text-*`, `border-*`, `rounded-*`, `shadow-*`, `ring-*`, `hover:*`, `focus:*`, or arbitrary values.

Use `cva`, semantic props such as `variant`, `size`, `tone`, and `state`, layout primitives, or slots instead of repeating raw classes.

## shadcn/ui Policy
Treat `shadcn/ui` components as a base layer, not as a place to dump app-specific styling.
If the app needs a new visual treatment, add a variant or wrap the primitive in a semantic component.
If the app needs a new composition pattern, add or extend a layout primitive in `src/components/ui/layout/**`.

## User feedback (Alert vs toast)

See `DOCUMENTATION.md` → **Alert vs toast**. Persistent or actionable page state → `Alert`; transient action outcomes and one-shot errors → Sonner (`notifySuccess` / `notifyError` / `notifyInfo`). Recoverable sidebar/feed errors may use inline copy + Retry without a duplicate toast.

## Non-Goals
- Do not rewrite untouched files.
- Do not restyle screens unless the current task already requires editing that screen.
- Do not spread a local cleanup into neighboring modules.
