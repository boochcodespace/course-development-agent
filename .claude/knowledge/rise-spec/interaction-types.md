# Interaction types: curated shortlist of 8 patterns

This file is the source of truth for which interaction type to recommend. Every pattern below is implementation-ready with use criteria, cognitive load profile, build complexity, sweet spots, anti-patterns, and accessibility recipes.

## Selection guide (read this first)

Match the Bloom's level and content shape to the pattern, then verify against the cognitive load and build complexity columns.

| Bloom's level | Content shape | First-choice patterns |
|---|---|---|
| Remember / Understand | Term to definition, paired info | Flip card grid |
| Remember / Understand | Spatial / visual exploration | Click-to-reveal hotspots, Interactive diagram |
| Apply | Classification or sorting | Drag-and-drop categorization |
| Apply | Procedural sequencing | Sortable sequence or timeline |
| Apply | Procedural decision flow | Decision tree explorer |
| Apply / Analyze | Single judgment decision | Branching scenario (mini) |
| Analyze / Evaluate | Multi-step judgment | Scenario simulator |
| Analyze / Evaluate | System or architecture comprehension | Interactive diagram |

If two patterns are plausible, prefer the one with lower cognitive load and lower build complexity unless the user is explicitly investing in a high-stakes capstone.

## Universal mismatch flags

- **Flip cards for Apply or higher** — flip cards are Remember/Understand only. Reject and propose drag-and-drop or scenario.
- **Drag-and-drop for accessibility-first audiences with no keyboard fallback** — always pair with a non-drag alternative (see `accessibility.md`).
- **Branching scenarios for novices without prerequisite knowledge** — they will fail without scaffolding; propose worked example first.
- **Decision tree for narrative or interpersonal skills** — use branching scenario instead.
- **Interactive diagram for arbitrary photos with no inherent structure** — use simple hotspots instead.

---

## 1. Drag-and-drop categorization

**Description.** Learner picks up items (text chips, images, icons) and drops them into 2 to 6 labeled bins to demonstrate classification. Best for taxonomies, "which goes where" decisions, and applying classification rules.

**Use when:** Bloom's Apply or Analyze; mutually exclusive categories with rules a learner can internalize; sorting or grouping mirrors a real-world activity.

**Avoid when:** Categories overlap; content is purely declarative recall; mobile-first audience with many items; accessibility-first audiences without robust keyboard alternative.

**Cognitive load:** Medium-high. Motor demands and visual scanning add extraneous load. Mitigate via segmenting and signaling.

**Sweet spots:**
- 2 to 4 categories (max 5)
- 6 to 12 draggable items total
- Defer correctness feedback to a Submit button (avoid eager-beaver per-item feedback)

**Mobile and touch:** Highest-failure environment. Targets at least 44x44 px; long-press to initiate drag (200 to 300ms); auto-scroll on edge proximity. **Provide tap-to-select-then-tap-to-place** as primary mobile interaction.

**Accessibility:** Old `aria-grabbed` and `aria-dropeffect` are deprecated. Do not use. Use canonical pattern: Tab to item, Space or Enter picks up, Arrow keys move focus among bins, Space or Enter drops, Esc cancels. Live region announces pickup, move, drop, cancel. Always provide an equivalent non-drag form (radio buttons or `<select>` per item) as fallback. See `accessibility.md` for full keyboard pattern.

**Build complexity:** Medium (3 to 6 days for accessible, polished version).

**Libraries:** dnd-kit (current recommendation, MIT, built-in `KeyboardSensor`); React Aria DragAndDrop; W3C APG Listbox-with-Rearrangeable Options as accessible reference.

---

## 2. Click-to-reveal hotspots

**Description.** Diagram or scene with marked clickable regions; selecting reveals associated content (text, image, audio, short video) in a popover, side panel, or modal. Gives learners agency to explore a complex visual.

**Use when:** Bloom's Remember or Understand; spatial or visual content (anatomy, equipment, dashboard tour, network map); learner-controlled pacing aligns with Mayer's Segmenting principle; non-sequential exploration.

**Avoid when:** Order matters; image is decorative; hotspot info is critical and cannot be missed (or gate with disclosed must-view-all rule).

**Cognitive load:** Low-medium. Aligns well with Spatial Contiguity, Segmenting, Signaling.

**Sweet spots:**
- 4 to 7 hotspots per image (4 ideal, 7 max)
- Each reveal: 1 to 3 short sentences or a few bullets; longer reveals go in a side panel layout

**Mobile and touch:** Pins at least 44x44 px; tap (not hover) to reveal; percentage-based pin positions; bottom sheet rather than popover on small screens.

**Accessibility:** Each pin is a real `<button>` with `aria-label` (for example "Hotspot 1 of 6: Forecast accuracy panel"), `aria-expanded`, and `aria-controls`. Reveal container is `role="dialog"` (modal) or `role="region"` (inline). Provide a text-list alternative under the image for screen readers. Live region announces "All 6 areas viewed."

**Build complexity:** Low-medium (1 to 3 days).

**Libraries:** Inline SVG plus vanilla JS; Floating UI for popover positioning; Headless UI or Radix Dialog for modals; W3C WAI Image Maps tutorial as canonical reference.

---

## 3. Branching scenario

**Description.** Learner takes the role of a character facing realistic decisions; choices alter subsequent scenes and outcome. Builds judgment in a safe environment. Cathy Moore and Ruth Clark are canonical references.

**Use when:** Bloom's Apply, Analyze, or Evaluate; complex contextual judgment-based skills (managing a difficult conversation, troubleshooting, ethical decisions, budget trade-offs); grey areas with multiple plausible answers; learners need to practice transfer.

**Avoid when:** Content is purely declarative; single-step decisions with one obvious answer (use mini-scenario); tight budget; learners lack prerequisite knowledge.

**Cognitive load:** High but mostly germane — by design.

**Sweet spots:**
- At least 7 decision points per playthrough (Cathy Moore's rule)
- 3 to 4 options per decision (one obviously bad, one obviously good, 1 to 2 tempting wrong answers)
- 15 to 40 scenes total
- 5 to 15 minutes per playthrough
- Encourage replay

**Anti-patterns to flag:**
- Information dumps disguised as scenarios (Moore's number one complaint)
- Telegraphed answers — wrong options must reflect real misconceptions
- Mid-scenario "Correct!" or "Incorrect!" interrupts (Moore's "eager-beaver feedback")
- Production overkill — invest in realistic content, not video or animation
- No debrief at end

**Feedback principle:** Show consequences, do not tell. Let the next scene reflect the choice. Optional end-of-scenario debrief.

**Mobile and touch:** Mostly works well; tap targets at least 44x44 px on options; captions on by default for any video.

**Accessibility:** Native semantic buttons or radiogroup. After each decision, focus moves to the new scene's heading (`tabindex="-1"` plus `.focus()`). All character names, dialogue, and setting in text. Captions or transcripts for any audio or video.

**Build complexity:** Medium-high (5 to 10+ days for build; design time often dominates with weeks of SME interviews).

**Tools:** Twine (Cathy Moore's recommended free tool, Harlowe or SugarCube formats); Articulate Storyline; Branchtrack; H5P Branching Scenario.

---

## 4. Sortable sequence or timeline

**Description.** Learner orders steps, events, or items into the correct sequence by dragging or using up and down controls. Tests procedural and chronological knowledge.

**Use when:** Bloom's Understand or Apply; inherently sequential content (procedure steps, approval workflow stages, month-end close order, escalation procedure); doing it out of order has real consequences.

**Avoid when:** Order is arbitrary; steps are parallel; more than 9 items (chunk into phases); single missing-step scenarios (use multiple-choice).

**Cognitive load:** Medium.

**Sweet spots:**
- 5 to 7 items (cap at 9; modern research suggests effective chunk capacity is closer to 4 — Cowan 2010)
- Score by both absolute position correctness and relative order; partial credit is fairer

**Mobile and touch:** Vertical layout is better than horizontal for mobile. Long-press to start drag; auto-scroll near edges. **Up and Down buttons preferred** on mobile.

**Accessibility:** Use W3C APG Listbox-with-Rearrangeable-Options pattern: `role="listbox"`, child `role="option"` items with `aria-posinset` and `aria-setsize`. Provide explicit Move Up and Move Down buttons (also satisfies WCAG 2.5.7). Optional Alt+Up and Alt+Down keyboard shortcut. Live region: "Run forecast moved to position 3 of 7."

**Build complexity:** Medium (2 to 4 days).

**Libraries:** dnd-kit Sortable preset; React Aria ListBox (best out-of-the-box accessibility); SortableJS for plain JS.

---

## 5. Decision tree explorer

**Description.** Learner-driven, **visible** hierarchical map of decisions or process steps. Structure is exposed (nodes, branches, parent and child); learner navigates non-linearly.

**Distinct from a branching scenario** (which hides structure inside a narrative): a decision tree foregrounds the structure as the learning object.

**Use when:** Bloom's Understand to Apply to Analyze; procedural job aids ("If X, then Y, else Z"); troubleshooting paths; escalation matrices; eligibility flows; **performance support and job aids** as much as instruction. Strong when learners need to see the whole logic.

**Avoid when:** Skill is narrative or interpersonal (use branching scenario); learners must practice the decision under pressure (a tree shows the answer, does not test it); logic is trivial (2 to 3 nodes).

**Cognitive load:** Medium. Trees externalize decision structure (reduces intrinsic load via signaling), but large trees raise extraneous load.

**Sweet spots:**
- Max 3 to 4 children per parent
- Max 4 to 5 levels deep
- Total nodes under roughly 25 to 30 for a learning explorer
- Top-down or left-right layout
- Always show the path the user has taken (breadcrumb or highlighted route)

**Anti-patterns:** Hiding structure (defeats the purpose); auto-expanding the entire tree; mixing decision logic with narrative; dead ends with no restart.

**Mobile and touch:** Default to a list or accordion fallback on viewports under 768px rather than 2D layout. Tap targets at least 44x44 px.

**Accessibility:** Two valid approaches:
- **Disclosure pattern (preferred for most eLearning):** each branch is `<button aria-expanded>` toggling a child group. Standard Tab navigation. Easier to implement, fewer SR bugs.
- **APG Tree role pattern:** `role="tree"` with `role="treeitem"`, `aria-expanded`, `aria-level`, `aria-setsize`, `aria-posinset`, single tab stop, arrow-key navigation (Right expands, Left collapses, Home and End jump).

W3C APG explicitly warns that tree role requires complex keyboard handling. Use disclosure unless the component is genuinely a hierarchical browse tree.

**Build complexity:** Medium-high. Vertical or list explorer: 8 to 16 hours. 2D flowchart with SVG: 24 to 48 hours.

**Libraries:** D3.js tree layouts; react-arborist; rc-tree; W3C APG Tree View pattern as canonical reference.

---

## 6. Flip card grid

**Description.** Grid of cards, each with front and back; tapping flips to reveal answer or info. Used for retrieval practice, definition review, paired information.

**Use when:** Bloom's Remember or Understand; term and definition pairs, Q&A pairs, icon to meaning, before and after, do and don't. Strong for retrieval practice if front is question and back is answer.

**Avoid when:** Items have logical sequence; back content is long (over 50 words); critical information is on the back (high-stakes content should not be hidden); large set (over 12); mobile-first with image-heavy cards.

**Cognitive load:** Low.

**Sweet spots:**
- 6 to 12 cards per grid
- 3 to 4 columns desktop, 2 tablet, 1 phone
- Front under 6 words; back under 40 to 50 words
- Flip animation under 400ms; respect `prefers-reduced-motion`

**Critical anti-patterns:**
- **Hover-to-flip** breaks on touch (first tap fires hover and may stick; second fires click)
- CSS-only flip with `rotateY` that leaves both faces in DOM — screen readers read both at once
- Hiding important information solely on the back

**Mobile and touch:** Trigger flip on click or tap and Enter or Space; ignore hover or gate it with `@media (hover: hover) and (pointer: fine)`. Tap targets at least 44x44 px. On phones, switch to carousel or stack rather than grid.

**Accessibility:** TPGi confirms this is a known hard pattern. There are no ARIA semantics that fit the pattern perfectly.
- Use `<button>` for the flip control with `role="group"` wrapping the card and `aria-labelledby` pointing to front title
- Don't use CSS-only flipping leaving both faces in DOM — toggle visibility with JS
- **Don't use `aria-expanded` or `aria-pressed`** — TPGi user testing found these confusing
- Best: change the button's accessible name dynamically ("Show definition for X" then "Show term for X") and/or use `aria-live="polite"` status region
- Keyboard: Tab between cards; Enter or Space flips; focus stays on card after flip
- Also include the front text on the back (so keyboard and magnification users still see context)

**Build complexity:** Low-medium (12 to 20 hours for fully accessible version).

---

## 7. Scenario simulator

**Description.** Multi-step, narrative-driven decision practice where the learner plays a role across a sequence of decisions, with consequences (intrinsic feedback) and optional coaching (instructional feedback) shaping later choices.

**Distinct from a single-decision branching scenario** in length, branching topology, and use of variables and state to carry consequences forward.

**Use when:** Bloom's Apply, Analyze, or Evaluate; situations that are strategic not procedural, have shades of gray, require multiple coordinated decisions, and are too risky to practice on the job (Cathy Moore criteria). For example: "respond to a sudden order surge" with coordinated decisions about expediting, allocation, and sourcing.

**Avoid when:** Single atomic decision; procedural with one right sequence; budget under 40 hours; cannot get a real SME for action-mapping interviews; novice audience without scaffolding.

**Cognitive load:** High by design — productive germane load. Apply pretraining principle.

**Branching topology** (Christy Tucker, Sam Kabo Ashwell):
- **Time cave** (every choice diverges, never reconverges): exponential blowup; only for very short scenarios
- **Gauntlet** (always returns to correct path): cheap but not authentic; Cathy Moore criticizes as "no real freedom"
- **Branch and bottleneck** (recommended): paths diverge briefly then converge at key plot points; learners can explore mistakes and self-correct

**Sweet spots:**
- 4 to 7 decisions per path
- 3 choices per decision (Best / OK / Poor — Christy Tucker)
- 30 to 60 total screens
- 1 best ending, 2 to 3 OK, 2 to 3 poor
- 8 to 20 minutes per playthrough

**Feedback principles:**
- **Show consequences, don't tell.** No "Correct!" or "Incorrect!" interrupts
- Use intrinsic feedback as primary channel
- Combine with optional or on-demand instructional feedback ("Why?" link) for novices
- Immediate coaching for novices; delayed for experts

**Anti-patterns:** Information dump before scenario (Moore: "throw them in the deep end"); generic stories; control-freak structure disguised as branching; exponential blowup; no state (early choices don't affect later screens); humiliation feedback; final MCQ that does not reflect the scenario.

**Accessibility:** Each choice is a `<button>`. After selection, move focus to new scene's heading. Provide reread button. Reading level under 9th grade unless audience is specialist.

**Build complexity:** High. 3 decisions, gauntlet, text-only Twine: 8 to 16 hours. 5 to 6 decisions, branch-and-bottleneck, character images, state: 40 to 80 hours. Full multi-path with audio, animations, SCORM: 120 to 250+ hours.

**Tools:** Twine (Harlowe or SugarCube); Articulate Storyline; Articulate Rise's Scenario Block (simple 2-person only); H5P Branching Scenario.

---

## 8. Interactive diagram

**Description.** Structured visual (system, anatomy, architecture, process) with **labels visible by default** plus selectable parts that reveal additional detail. The diagram itself is the curriculum.

**Differs from click-to-reveal hotspots** in three ways: (1) structure is intentional and engineered; (2) labels visible at rest; (3) annotations are connected via leaders or numbered callouts.

**Use when:** Bloom's Understand to Analyze; system architectures (for example a product data model), software UI tours, anatomy, process flows, network or topology diagrams, network maps. Strong as a first-contact interaction near course start.

**Avoid when:** Visual is a photograph with no inherent structure (use simple hotspots); fewer than 4 parts; sequential process (use stepper); content is judgment-based.

**Cognitive load:** Medium. Strong germane load when designed well. Apply spatial contiguity, signaling, pretraining.

**Sweet spots:**
- 5 to 9 primary annotated parts (Miller's 7 plus or minus 2)
- If over 9, group them
- Annotation panel under 80 words per part

**Visual rules:** Always-visible labels with leader lines or numbered callouts; place labels close to parts; visited-state tracking; **SVG strongly preferred over raster**; consistent color semantics; layer toggles for complex diagrams.

**Mobile and touch:** Pinch-zoom and pan are essential (SVG natively supports). Tap targets at least 44x44 px even for small parts (pad invisible hit areas). Annotation panel as bottom sheet rather than overlay. **Provide list-view fallback.**

**Accessibility:** The most nuanced of the patterns. Two SVG strategies (W3C SVG Accessibility):
1. **"SVG as image"** with single accessible name plus long description: `role="img"`, `aria-labelledby` pointing to `<title>` plus `<desc>`. For static illustrations.
2. **"SVG as interactive widget"** when parts must be individually focusable. Each interactive `<g>` or `<path>` becomes a `<button>` (or has `role="button"`, `tabindex="0"`, `aria-label`).

For an explorable diagram, use strategy 2 with an accessible-image-equivalent fallback.

**Three-layer alt text approach:**
- One-sentence summary as SVG accessible name
- Paragraph-length structural overview as `<desc>` or `aria-describedby`
- Fully linearized text-equivalent list elsewhere on the page

For data or structural diagrams, a table or nested list version is the most reliable equivalent.

**Build complexity:** Medium-high. Single SVG with side panel and basic accessibility: 12 to 24 hours. Full version with layer toggles, visited state, panning, text equivalent, keyboard nav: 40 to 80 hours. Authoring the diagram itself often dominates.

**Libraries:** Inline SVG plus vanilla JS; Snap.svg; SVG.js; D3.js for data binding. Rise 360 native Labeled Graphic block as baseline.

---

## Cross-pattern guidance

### Mayer's principles to apply universally
- **Coherence** — strip decoration that does not encode meaning
- **Signaling** — highlight active state
- **Spatial Contiguity** — labels near referents
- **Segmenting** — chunked pace
- **Pre-training** — orient before complex interaction
- **Personalization** — conversational tone

### Universal accessibility floor (WCAG 2.2 AA)
- All keyboard-operable
- Visible focus indicator
- Targets at least 24x24 px AA (44x44 best practice)
- No color-only meaning
- Contrast at least 4.5:1 text and 3:1 UI
- Status messages via live regions
- Single-pointer alternative for any drag or swipe (WCAG 2.5.7)

### Universal feedback principles
- Avoid platitudinal "Good job!"
- Defer correctness feedback until learner submits complete answer
- Always provide retry and reset
- Explain consequence of wrong choices, not just correctness

### Distinguishing similar patterns
- **Decision tree** shows structure visibly (referenceable); **branching scenario** hides structure inside story (experiential)
- **Interactive diagram** has visible labels and engineered structure; **click-to-reveal hotspots** have hidden interest points on arbitrary images. Diagrams are SVG-first; hotspots are often raster-first
- **Sortable sequence** tests procedural order; **decision tree** tests procedural choice points
- **Flip cards** are Remember/Understand only; for Apply use drag-and-drop or scenario
