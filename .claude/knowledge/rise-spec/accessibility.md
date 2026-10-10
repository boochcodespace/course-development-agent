# Accessibility (WCAG 2.1 AA + key 2.2 criteria)

This file is the source of truth for accessibility enforcement. Every spec section 11 (accessibility requirements) draws from here. Default target: WCAG 2.1 AA plus key 2.2 criteria (2.4.11/2.4.13 focus appearance, 2.5.7 dragging, 2.5.8 target size). Single bar satisfies Section 508, ADA Title II/III, EU EN 301 549, and most enterprise procurement.

## Table of contents

1. The 25-item enforcement checklist (every spec)
2. WCAG criteria explained (specific to interactive learning)
3. Keyboard interaction patterns by component type
4. Live regions
5. Color contrast quick reference
6. Reduced motion
7. Focus management and tab order
8. Rise 360 / iframe-specific accessibility
9. Section 508 alignment

---

## 1. The 25-item enforcement checklist

Every spec must require these 25 items. Copy the relevant subset into Section 11 and customize for the chosen interaction type.

1. Semantic HTML first; ARIA only when no native element fits
2. Every interactive element keyboard-operable with APG-canonical key map
3. No keyboard trap; Esc always exits
4. Visible focus indicator at least 2 CSS px, at least 3:1 contrast; use `:focus-visible`
5. Tab and DOM order matches visual reading order
6. Every interactive element has accessible name
7. Correct ARIA role with all required state attributes synced
8. Drag-and-drop has TWO non-drag alternatives (keyboard select-then-place AND pointer click-source-then-target)
9. Color is never the only conveyor of meaning
10. Text contrast at least 4.5:1 (3:1 large); UI/icon/border at least 3:1; verified in all states
11. Images and hotspots have alt text describing function
12. Live region declared in DOM at load; state changes announced
13. Focus programmatically managed on navigation events
14. `prefers-reduced-motion: reduce` honored
15. Headings hierarchical and don't skip levels (start at H3 inside Rise iframe)
16. `<html lang>` set on embedded `index.html`
17. No nested iframes; `body { background: transparent }`; no blob/file-system reliance
18. Touch targets at least 24x24 CSS px (44x44 preferred for mobile)
19. Error messages identify problem in text (3.3.1) and associated with control
20. Modal dialogs use `role="dialog" aria-modal="true"`, focus-trap, Esc-to-close, focus restoration
21. No `aria-grabbed` or `aria-dropeffect` (deprecated); no `aria-hidden="true"` on focusable elements
22. Tested with at least two screen reader plus browser combos: NVDA+Firefox/Chrome, JAWS+Chrome, VoiceOver+Safari
23. Tested keyboard-only (mouse unplugged)
24. Tested at 200% zoom and 320 CSS-px viewport (WCAG 1.4.10 Reflow)
25. Spec includes textual alternative or summary for any complex visual interaction

---

## 2. WCAG criteria explained (specific to interactive learning)

For each criterion, plain English meaning plus what the spec must enforce:

**1.1.1 Non-text Content (A):** Every image, hotspot, graphic has text alternative. Decorative use `alt=""` or `aria-hidden="true"` (never both on focusable). Hotspots describe function not visual location ("Mercury", not "circle in upper left").

**1.3.1 Info and Relationships (A):** Visual structure programmatically determinable. Use semantic HTML; group related controls; decision tree nodes expose level, setsize, posinset.

**1.4.1 Use of Color (A):** Correct/incorrect feedback includes text, icon, or pattern plus color. Required fields use color plus asterisk plus `aria-required`.

**1.4.3 Contrast Minimum (AA):** 4.5:1 body text; 3:1 large text (at least 18pt or 14pt bold). Test in all states.

**1.4.10 Reflow (AA):** Content reflows without two-dimensional scrolling at 320 CSS px width. Test every interactive at narrowest mobile.

**1.4.11 Non-text Contrast (AA):** UI components, focus indicators, meaningful graphics at least 3:1 against adjacent colors. Drag handles, drop zone outlines, selected/focused indicators all at least 3:1.

**2.1.1 Keyboard (A):** All functionality keyboard-operable. Drag-and-drop has full keyboard equivalent.

**2.1.2 No Keyboard Trap (A):** Modal dialogs trap inside until dismissed; Esc and close button always free focus. Drag operations cancellable with Esc.

**2.4.3 Focus Order (A):** DOM order matches visual order. No `tabindex > 0`. Branching scenarios move focus to new content after choice.

**2.4.7 Focus Visible (AA):** Never `outline: none` without replacement. Use `:focus-visible`. Indicator at least 2 CSS px thick, 3:1 contrast against unfocused state and background.

**2.4.11/2.4.13 Focus Appearance (WCAG 2.2 AA):** Stricter focus-indicator requirements — at least 2 CSS px thick perimeter, at least 3:1 contrast against unfocused state, not entirely hidden by author-created content.

**2.5.1 Pointer Gestures (A):** Multi-point and path-based gestures need single-pointer alternative.

**2.5.7 Dragging Movements (WCAG 2.2 AA):** Every drag operation has no-drag alternative. Sortable lists need explicit Move Up/Down buttons.

**2.5.8 Target Size Minimum (WCAG 2.2 AA):** Targets at least 24x24 CSS px (best practice 44x44 for mobile).

**3.3.1 Error Identification (A):** "Incorrect" feedback in text, not just visual. Errors associated with control via `aria-describedby` or live region.

**4.1.2 Name, Role, Value (A):** Every custom widget uses correct ARIA role. State attributes synced (`aria-pressed`, `aria-expanded`, `aria-selected`, `aria-checked`, `aria-current`). Prefer native HTML over ARIA.

**4.1.3 Status Messages (AA):** Status updates that don't move focus must still be announced. Use `role="status"` / `aria-live="polite"` (or `role="alert"` / `aria-live="assertive"` for true errors). **Live-region container exists in DOM before content is injected.**

---

## 3. Keyboard interaction patterns by component type

Authoritative source: W3C ARIA Authoring Practices Guide (APG).

### Drag-and-drop (categorization)
Two-step "select then place" pattern:
1. Tab to source item
2. Space or Enter picks up
3. Tab or Arrow moves focus to drop target
4. Space or Enter drops
5. Esc cancels at any point

Live region announces each transition: "Picked up forecast accuracy. Moved to category Strategic. Dropped in Strategic. 3 of 6 items placed."

### Sortable sequence (W3C APG Listbox-Rearrangeable)
- `role="listbox"` plus child `role="option"`
- `aria-posinset` and `aria-setsize` on each option
- Visible Move Up and Move Down buttons (also satisfies WCAG 2.5.7)
- Optional Alt+Up and Alt+Down keyboard shortcut
- Live region: "Run forecast moved to position 3 of 7"

### Click-to-reveal hotspots
- Each pin is a real `<button>` overlay
- `aria-label` describes function ("Hotspot 1 of 6: Forecast accuracy panel")
- Tab through in reading order
- Enter or Space activates
- Reveal container is `role="dialog"` (modal) or `role="region"` (inline)
- After reveal, focus moves to dialog or stays on pin (depending on layout)

### Branching scenarios
- Native `<button>` for choices, or radiogroup if learner needs to confirm
- After selection, `tabindex="-1"` plus `.focus()` on new scene heading
- Provide reread button
- All character names, dialogue, setting in text
- Captions or transcripts for any audio/video

### Flip cards
- Use `<button>` for the flip control
- `role="group"` wrapping the card with `aria-labelledby` pointing to front title
- Don't use CSS-only flipping that leaves both faces in DOM — toggle visibility with JS
- **Don't use `aria-expanded` or `aria-pressed`** — TPGi user testing found these confusing
- Best: change button accessible name dynamically ("Show definition for X" then "Show term for X") and/or use `aria-live="polite"` status region
- Keyboard: Tab between cards; Enter or Space flips; focus stays on card after flip
- Include front text on the back (so keyboard and magnification users still see context)

### Decision tree explorer
Two valid approaches:

**Disclosure pattern (preferred for most eLearning):**
- Each branch is `<button aria-expanded>` toggling a child group
- Standard Tab navigation
- Easier to implement, fewer SR bugs

**APG Tree role pattern (only for true hierarchical browse trees):**
- `role="tree"` with `role="treeitem"`
- `aria-expanded`, `aria-level`, `aria-setsize`, `aria-posinset`
- Single tab stop, arrow-key navigation
- Right expands, Left collapses, Home and End jump
- W3C APG explicitly warns about complexity

### Tabs
APG Tabs pattern:
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Single tab stop (roving tabindex)
- Arrow keys to move between tabs

### Interactive diagram
Two SVG strategies (W3C SVG Accessibility):
1. **"SVG as image"** with single accessible name plus long description — `role="img"`, `aria-labelledby` pointing to `<title>` plus `<desc>`. For static illustrations.
2. **"SVG as interactive widget"** when parts must be individually focusable. Each interactive `<g>` or `<path>` becomes a `<button>` (or has `role="button"`, `tabindex="0"`, `aria-label`).

For an explorable diagram, use strategy 2 with an accessible-image-equivalent fallback.

**Three-layer alt text approach:**
- One-sentence summary as SVG accessible name
- Paragraph-length structural overview as `<desc>` or `aria-describedby`
- Fully linearized text-equivalent list elsewhere on the page

---

## 4. Live regions

| Goal | Markup |
|---|---|
| Non-urgent status | `role="status"` or `aria-live="polite"` |
| Urgent error/alert | `role="alert"` or `aria-live="assertive"` |
| Announce entire region | `aria-atomic="true"` |

**Critical rules:**
- Container exists in DOM before content insertion
- Default to polite
- Reserve assertive for genuine errors
- Don't double up (`role="alert" aria-live="assertive"` causes double announcements in iOS VoiceOver)
- Keep messages short

---

## 5. Color contrast quick reference

- Normal text: 4.5:1
- Large text (at least 18pt or 14pt bold): 3:1
- UI components, focus indicators, meaningful graphics: 3:1
- Color must not be the only signaller of state

Verify in all interaction states (default, hover, focus, active, disabled, error, completed).

---

## 6. Reduced motion

Detect `prefers-reduced-motion: reduce` and disable or substitute non-vestibular alternatives:
- Flip cards: substitute fade or instant face-swap
- Carousels and scenario transitions: crossfade with no movement
- Drag-and-drop: snap animation under 200ms or disabled
- Vestibular triggers to remove: spinning, parallax, large-scale scale, sliding panels covering more than 25% viewport, flashing or strobing

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Focus management and tab order

- DOM source order matches visual order; avoid `tabindex > 0`
- `tabindex="-1"` for programmatic focus targets after navigation
- Modal opens: focus moves in, traps, restores to trigger on close
- Branching navigation: focus to new screen's first heading
- Composite widgets: single tab stop with arrow-key roving (either `tabindex` shuffling or `aria-activedescendant`)
- Skip links for long interactions

---

## 8. Rise 360 / iframe-specific accessibility

- Code Block iframes now include accessible name (December 2025 Articulate update)
- Inside `index.html`:
  - `<html lang="en">`
  - Single `<h2>` or `<h3>` (start at H3 to nest under Rise's wrapper)
  - No nested iframes
  - `body { background: transparent }`
  - Focus reachable on first Tab in
- Use `window.parent.postMessage({type:'complete'}, '*')` for completion
- **Don't trap focus permanently inside iframe** — users must Shift+Tab back to Rise nav
- Rise's keyboard focus indicator inside Interactive blocks may be partially obscured; add `outline-offset` to push indicator outside element bounds

---

## 9. Section 508 alignment

Section 508 (Revised, 2018) incorporates WCAG 2.0 Level A and AA by reference. **Building to WCAG 2.1 AA exceeds Section 508's letter** but is the de facto US enterprise expectation, satisfies DOJ Title II ADA rule, and is forward-compatible with WCAG 2.2 (which adds 2.4.11 / 2.4.13 focus appearance, 2.5.7 dragging, 2.5.8 target size 24x24 min, 3.2.6 consistent help, 3.3.7 redundant entry, 3.3.8 accessible authentication).

For the skill: target WCAG 2.1 AA plus the most relevant 2.2 criteria (2.4.11 / 2.4.13 focus, 2.5.7 dragging, 2.5.8 target size). Single bar satisfies Section 508, ADA Title II/III, EU EN 301 549, and most enterprise procurement.
