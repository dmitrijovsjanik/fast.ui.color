# Design System Rules for UI Development

This file contains actionable design rules for generating frontend code. Every rule is grounded in cognitive science and UX research — references are provided as context, not decoration.

---

## 1. Spacing System

Use an **8pt base grid**. All spacing values must be multiples of 8.

```
--space-1: 4px;    /* micro: helper text, tight internal gaps */
--space-2: 8px;    /* base: minimum gap between related elements, icon padding */
--space-3: 16px;   /* standard: mobile margins, gutters, card padding */
--space-4: 24px;   /* medium: section separators on mobile */
--space-5: 32px;   /* large: between form sections, content groups */
--space-6: 48px;   /* xl: between major page sections */
--space-7: 64px;   /* hero: major section breaks, above-the-fold */
```

### The Cardinal Rule of Spacing

**Internal spacing (padding) must NEVER exceed external spacing (margin).** Elements must feel cohesive inside and distinct from neighbors.

```
/* CORRECT */
.card { padding: 16px; }
.card + .card { margin-top: 24px; }

/* WRONG — padding exceeds margin between cards */
.card { padding: 32px; }
.card + .card { margin-top: 16px; }
```

### Proximity (Gestalt — Wertheimer, 1923)

Elements placed close together are perceived as a group. Use this instead of borders and dividers:
- Group related controls with `8–16px` gaps
- Separate unrelated groups with `24–48px` gaps
- Place labels closer to their field than to the neighboring field

```
/* Form field: label must be closer to its input than to the previous input */
.form-group + .form-group { margin-top: 24px; }
.form-label { margin-bottom: 4px; }  /* tight bond: label → field */
```

---

## 2. Typography Scale

Use a **modular scale** based on a ratio applied to a 16px base.

| Context | Ratio | Name |
|---|---|---|
| Dense SaaS, dashboards | 1.125 | Major Second |
| General-purpose UI | 1.200 | Minor Third |
| Websites and apps (default) | 1.250 | Major Third |
| Blogs, editorial | 1.333 | Perfect Fourth |
| Marketing, landing pages | 1.500+ | Perfect Fifth / Golden Ratio |

### Default Scale (Major Third — 1.250)

```
--text-xs:   10px;   /* 16 ÷ 1.25² ≈ fine print, legal */
--text-sm:   13px;   /* 16 ÷ 1.25  ≈ captions, helper text */
--text-base: 16px;   /* body text */
--text-lg:   20px;   /* 16 × 1.25  = subheadings */
--text-xl:   25px;   /* 16 × 1.25² = section headings */
--text-2xl:  31px;   /* 16 × 1.25³ = page headings */
--text-3xl:  39px;   /* 16 × 1.25⁴ = hero headings */
--text-4xl:  49px;   /* 16 × 1.25⁵ = display / marketing */
```

### Size Hierarchy Rule

Maintain **maximum 3 distinct sizes** per screen to keep hierarchy readable (NNGroup). Each step must be **≥20–25% larger** than the previous to be perceptible (Weber's Law).

### Font Weight System

```
--font-light:    300;  /* de-emphasized text only. Avoid for body. */
--font-regular:  400;  /* body text, default */
--font-medium:   500;  /* subheadings, emphasis */
--font-semibold: 600;  /* section headings */
--font-bold:     700;  /* page headings, primary emphasis */
```

Avoid Ultralight and Thin weights — poor readability and accessibility (Apple HIG).

### Line Height and Measure

```
/* Body text */
line-height: 1.5;        /* optimal for readability (Smashing Magazine: 1.46–1.48) */
max-width: 65ch;          /* 55–75ch range, 65ch ideal for single column */

/* Headings */
line-height: 1.1–1.3;    /* tighter for large text */

/* Fluid typography */
font-size: clamp(16px, 1rem + 0.5vw, 20px);
```

---

## 3. Color and Contrast

### Semantic Color Token Architecture

Use three layers — never reference raw values in components:

```
/* Layer 1: Primitives (raw values) */
--blue-500: #3b82f6;
--red-500: #ef4444;

/* Layer 2: Semantic (purpose-mapped) */
--color-primary: var(--blue-500);
--color-error: var(--red-500);
--color-surface: #ffffff;
--color-on-surface: #1a1a1a;

/* Layer 3: Component (context-specific) */
--button-bg: var(--color-primary);
--button-text: var(--color-on-surface-inverse);
--input-border-error: var(--color-error);
```

### WCAG Contrast Requirements (Non-Negotiable)

| Standard | Normal text (<18pt) | Large text (≥18pt / ≥14pt bold) | UI components |
|---|---|---|---|
| **AA (minimum)** | **4.5:1** | 3:1 | 3:1 |
| **AAA (enhanced)** | 7:1 | 4.5:1 | — |

- 4.5:1 is the **floor**, not the target. Aim higher.
- **Never use color as the sole indicator** of state (errors, success, status). Always pair with text, icons, or patterns. ~8% of men are color-deficient.

### The 60-30-10 Rule

```
60% — dominant neutral (backgrounds, surfaces)
30% — secondary color (cards, secondary surfaces, text)
10% — accent color (CTAs, highlights, alerts)
```

Accent colors lose power when overused. If everything is highlighted, nothing is.

---

## 4. Interactive Elements

### Touch Targets

```
/* Apple HIG */
min-width: 44px;
min-height: 44px;

/* Material Design */
min-width: 48px;
min-height: 48px;

/* Minimum gap between targets */
gap: 8px;
```

These are not suggestions — error rates spike below these thresholds (Fitts's Law).

### Button Hierarchy

```
/* Primary — one per screen/section, high contrast */
.btn-primary { background: var(--color-primary); color: white; font-weight: 600; }

/* Secondary — supporting actions, lower visual weight */
.btn-secondary { background: transparent; border: 1px solid var(--color-border); }

/* Destructive — red, always requires confirmation for irreversible actions */
.btn-destructive { background: var(--color-error); color: white; }
```

**Von Restorff Effect:** The primary CTA must visually differ from all other buttons. If multiple elements compete for attention, none wins.

---

## 5. Layout Patterns

### Grid System

Use a **12-column grid** — divisible into halves, thirds, quarters, sixths.

```
/* Responsive columns (Material Design) */
Mobile (0–599px):   4 columns,  16px margins
Tablet (600–904px): 8 columns,  32px margins
Desktop (905px+):  12 columns,  24px gutters
```

### Content Width Limits

```
--content-max-width: 1200px;   /* main content container */
--text-max-width: 65ch;         /* readable text blocks */
--form-max-width: 480px;        /* single-column forms */
```

### Card Layout

Cards are the dominant pattern for grouped content (NNGroup: "container for short, related pieces of information"):

```
.card {
  padding: var(--space-3);          /* 16px internal */
  border-radius: 8px;
  background: var(--color-surface);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);  /* elevation = figure-ground separation */
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);              /* 24px between cards > 16px inside cards */
}
```

---

## 6. Forms

### Structure Rules

1. **Labels above fields** on mobile — creates clear vertical flow (Baymard Institute)
2. **Single-column layout** — multi-column forms break vertical scanning; 16% of sites make this mistake
3. **Field width matches expected input** — a CVV field should not be as wide as an email field
4. **Never use placeholder text as labels** — users lose context after typing begins. Baymard calls this "false simplicity"
5. **Group related fields** under clear section headings: "Personal Info", "Shipping", "Payment"
6. **Multi-step > single-step** for long forms — 86% completion vs 68% (HubSpot data)

### Validation

```
/* Inline validation — show errors next to the field, not at page top */
.field-error {
  color: var(--color-error);
  font-size: var(--text-sm);
  margin-top: var(--space-1);     /* 4px — tight proximity to the field */
}

/* Error border — red + icon, never color alone */
.input--error {
  border-color: var(--color-error);
  /* Plus an error icon inside the field */
}
```

- Validate on blur (after user leaves field), never while typing
- Don't mark empty required fields as errors before the user interacts
- Show password requirements as a checklist, updating in real time

### Error Prevention (Poka-Yoke)

- Use constrained inputs: date pickers instead of free text, steppers instead of manual number entry
- Block impossible states: disable past dates, restrict input length, auto-format phone/card numbers
- Provide undo for destructive actions — minimum 5-second buffer (Gmail-style "Undo")
- Require confirmation dialogs for irreversible actions (delete account, discard draft)
- Auto-save user progress — never lose data on navigation or payment errors

---

## 7. Feedback and System Status

Every user action must produce visible feedback within **100ms** (perceived as instant). Delays beyond **1 second** require a progress indicator.

```
/* Loading states */
.skeleton { /* skeleton screen > spinner for content loading */ }
.progress-bar { /* for operations with known duration */ }
.spinner { /* only for unknown-duration operations */ }

/* Success/error feedback */
.toast {
  /* Appears near the action trigger, not at page top */
  /* Includes undo action for reversible operations */
  /* Auto-dismisses in 5–8 seconds */
}
```

### State Indicators

- Current step in multi-step flows (breadcrumbs, stepper)
- Active/selected states on navigation items
- Saving/saved status for auto-save
- Empty states with constructive guidance (not just "No results")

---

## 8. Visual Hierarchy Checklist

Apply in this order:

1. **Size** — primary content largest, supporting content smallest (max 3 levels)
2. **Color/contrast** — high contrast for primary actions, muted for secondary
3. **Weight** — bold for headings, regular for body
4. **Spacing** — more space around important elements (macro whitespace = premium feel)
5. **Position** — top-left gets ~41% of initial attention (F/Z scanning patterns)

### Squint Test

Step back and blur your vision. If the visual hierarchy isn't immediately obvious — if your eye isn't drawn to the primary element first — rework it. This is not metaphorical; it's the simplest validation method (NNGroup).

### Scanning Pattern Design Goals

| Pattern | Quality | Caused by |
|---|---|---|
| F-pattern | **Bad** — users miss content | Walls of text, poor structure |
| Layer-cake | **Best** — users scan headings efficiently | Strong typographic hierarchy, clear subheadings |
| Z-pattern | **Good** — works for visual landing pages | Minimal text, strong focal points |

Design for **layer-cake** pattern: use descriptive subheadings, break content into scannable sections.

---

## 9. Navigation and Information Architecture

### Key Conventions (Violating These Breaks Expectations)

- Logo: **top-left**, links to home
- Primary navigation: **top** (horizontal) or **left** (sidebar)
- Search: **top area**, magnifying glass icon (🔍)
- Shopping cart / primary action: **top-right**
- Centering logo instead of left-aligning makes home navigation **6× harder** (NNGroup)

### Mobile Navigation

- Tab bar: **3–5 items maximum** (Apple HIG recommendation, backed by working memory limits)
- Always include text labels with icons — "universally recognized icons are extremely rare" (NNGroup)
- Hidden navigation (hamburger menu) **reduces discoverability by ~50%** — use visible tabs when possible

### Hick's Law (Decision Time)

Decision time increases logarithmically with options: `RT = a + b × log₂(n)`

Practical application:
- Limit choices per screen to what the user needs at that step
- Use progressive disclosure: show basic options first, reveal advanced on demand
- Pricing pages: **3–4 tiers** maximum (SaaS standard)
- Highlight one recommended option (Von Restorff) to reduce decision paralysis

---

## 10. Accessibility Baseline

These are requirements, not nice-to-haves:

- [ ] All text meets **4.5:1 contrast** (AA minimum)
- [ ] Touch targets ≥ **44×44px** (48×48px preferred)
- [ ] Color is never the **sole** state indicator
- [ ] Images have **alt text**
- [ ] Interactive elements are **keyboard-accessible** (Tab, Enter, Escape)
- [ ] Focus states are **visible** (never `outline: none` without replacement)
- [ ] Form fields have associated **`<label>` elements** (not just placeholder text)
- [ ] Modals trap focus and are dismissible with **Escape**
- [ ] Animations respect **`prefers-reduced-motion`**

---

## 11. Dark Theme Rules

When implementing dark themes:

- Do **not** simply invert colors. Dark backgrounds need **reduced contrast** — pure white (#fff) on pure black (#000) causes halation (glowing text effect)
- Use **off-white text** (~87% opacity / #E0E0E0) on **dark gray** surfaces (#121212–#1E1E1E)
- Maintain color hierarchy through **surface elevation**: higher surfaces = slightly lighter
- Reduce saturation of accent colors — vivid colors that work on white can vibrate on dark backgrounds
- **Re-test all contrast ratios** — a color pair that passes AA on light may fail on dark

```
/* Material Design dark theme elevation */
--surface-0: #121212;     /* base */
--surface-1: #1E1E1E;     /* cards, elevated */
--surface-2: #232323;     /* menus, popovers */
--surface-3: #282828;     /* highest elevation */
--on-surface:  rgba(255, 255, 255, 0.87);  /* primary text */
--on-surface-medium: rgba(255, 255, 255, 0.60);  /* secondary text */
--on-surface-disabled: rgba(255, 255, 255, 0.38);  /* disabled text */
```

---

## 12. Anti-Patterns (Do Not Do)

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Placeholder-only labels | Users lose context mid-input | Labels above fields, always visible |
| Multi-column forms on mobile | Breaks vertical scan flow | Single column |
| Icons without text labels | Only ~5 icons are universally understood | Always add text |
| Error messages at page top only | User can't find the problem field | Inline errors next to the field |
| "Are you sure?" without specifics | Doesn't help user evaluate risk | State what will happen: "Delete 3 files permanently?" |
| Infinite nesting (hamburger → submenu → submenu) | Recall-heavy, users get lost | Flatten IA, use visible navigation |
| 3D effects, gradients on charts | Chartjunk — distorts data perception (Tufte) | Clean, flat data visualization |
| Auto-playing media | Violates user control and autonomy | User-initiated playback only |
| Walls of unstyled text | Causes F-pattern scanning (bad) | Subheadings, chunking → layer-cake pattern |
| More than 3 font sizes on one screen | Hierarchy becomes unreadable | Stick to 3 levels max |

---

## Quick Reference: Cognitive Principles → Code Decisions

| Principle | What it means | Design decision |
|---|---|---|
| **Proximity** (Gestalt) | Close = related | padding < margin between groups |
| **Similarity** (Gestalt) | Same style = same function | Consistent component tokens |
| **Figure-Ground** (Gestalt) | Foreground pops from background | Elevation, shadows, overlay dimming |
| **Closure** (Gestalt) | Brain completes partial shapes | Truncated cards hint at scroll |
| **Common Fate** (Gestalt) | Moves together = belongs together | Animate grouped elements in sync |
| **Hick's Law** | More options = slower decisions | Progressive disclosure, limit choices |
| **Fitts's Law** | Bigger + closer = easier to click | 44px+ touch targets, primary CTA prominent |
| **Von Restorff** | Different = memorable | One visually distinct CTA per section |
| **Miller/Cowan** | Working memory: 3–5 chunks | Group info into 3–5 sections, multi-step forms |
| **Weber's Law** | Size differences must be proportional | Use modular type scales (×1.2–1.5) |
| **Recognition > Recall** | Show, don't make users remember | Visible navigation, recent items, autocomplete |
| **Aesthetic-Usability** | Beautiful = perceived as easier | Clean design increases error tolerance |
