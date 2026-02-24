# KodNest Premium Build System

Design system for a serious B2C product. Calm, intentional, coherent, confident.

---

## Design philosophy

- **Calm, intentional, coherent, confident**
- Not flashy, not loud, not playful, not hackathon-style
- No gradients, no glassmorphism, no neon colors, no animation noise
- One mind; no visual drift

---

## Color system (max 4)

| Role      | Token           | Value     | Use                    |
|-----------|-----------------|-----------|------------------------|
| Background| `--kn-background`| `#F7F6F3` | Page, cards, inputs    |
| Text      | `--kn-text`     | `#111111` | Primary copy           |
| Accent    | `--kn-accent`   | `#8B0000` | Primary actions, focus |
| Success   | `--kn-success`  | `#4A5D4A` | Shipped, success       |
| Warning   | `--kn-warning`  | `#8B7355` | In progress, caution   |

Use only these. No extra palette.

---

## Typography

- **Headings:** Serif (`Georgia`), large, confident, generous spacing
- **Body:** Sans-serif (`Segoe UI` / system), 16–18px, line-height 1.6–1.8
- **Text blocks:** Max width `720px` (`--kn-text-max-width`)
- No decorative fonts, no random sizes

---

## Spacing (strict scale)

Use only: **8px, 16px, 24px, 40px, 64px**

| Token         | Value |
|---------------|-------|
| `--kn-space-1`| 8px   |
| `--kn-space-2`| 16px  |
| `--kn-space-3`| 24px  |
| `--kn-space-4`| 40px  |
| `--kn-space-5`| 64px  |

Never use 13px, 27px, etc. Whitespace is part of the design.

---

## Global layout structure

Every page must follow this order:

1. **Top Bar** — Project name (left) | Step X / Y (center) | Status badge (right)
2. **Context Header** — One large serif headline, one-line subtext, clear purpose
3. **Primary Workspace (70%)** — Main product interaction; clean cards, predictable components
4. **Secondary Panel (30%)** — Step explanation, copyable prompt box, actions (Copy, Build in Lovable, It Worked, Error, Add Screenshot)
5. **Proof Footer** — Checklist: □ UI Built □ Logic Working □ Test Passed □ Deployed (each requires user proof)

---

## Components

- **Primary button:** Solid deep red (`--kn-accent`). Secondary: outlined, same radius.
- **Hover:** Same transition everywhere (175ms ease-in-out). No bounce, no parallax.
- **Inputs:** Clean borders, no heavy shadows, clear focus state (accent border).
- **Cards:** Subtle border (`--kn-border`), no drop shadows, padding from spacing scale.
- **Border radius:** One value everywhere (`--kn-radius`: 6px).

---

## Interaction

- **Transitions:** 150–200ms, ease-in-out (`--kn-transition`: 175ms). No bounce, no parallax.

---

## Error and empty states

- **Errors:** Explain what went wrong and how to fix it. Never blame the user. Use `.kn-error`, `.kn-error__title`, `.kn-error__message`, `.kn-error__fix`.
- **Empty states:** Provide the next action. Use `.kn-empty`, `.kn-empty__title`, `.kn-empty__text`, `.kn-empty__action`. Never feel dead.

---

## File structure

```
design-system/
  tokens.css       — Colors, type, spacing, layout vars
  base.css         — Reset, body, headings, paragraphs
  layout.css       — Top bar, context header, workspace, panel, proof footer
  components.css   — Buttons, inputs, cards, badges, prompt box, error/empty
  design-system.css — Single import (use this in the app)
  DESIGN-SYSTEM.md — This doc
```

**Usage:** Link or import `design-system/design-system.css` once. Use the `kn-` class prefix and layout classes for every page.
