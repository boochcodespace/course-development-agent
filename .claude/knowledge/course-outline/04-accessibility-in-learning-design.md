# Accessibility in learning design

Accessibility isn't a compliance afterthought — it's a quality floor. An inaccessible tapa isn't merely illegal in many jurisdictions (WCAG 2.1 AA is the baseline under the 2024 DOJ Title II rule in the U.S., the EU Accessibility Act 2025, and EN 301 549 for public-sector content), it's a tapa that doesn't teach. This module covers four accessibility dimensions, maps them to UDL, and gives checklists for AI-generated output.

## Cognitive accessibility

**Plain language.** Follow the Federal Plain Language Guidelines (plainlanguage.gov) and the Plain Writing Act of 2010 model: write for your audience, use active voice, prefer common words, keep sentences to 15–20 words, one topic per paragraph. Aim for **Flesch-Kincaid Grade 8 or below** for general audiences; Grade 6 for consumer health (CDC Clear Communication Index).

**Chunking.** Miller (1956) estimated working memory at 7 ± 2 items; Cowan (2001, *Behavioral and Brain Sciences*, 24(1)) revised this to ~4 ± 1 when rehearsal is blocked. Group related items in clusters of 3–5.

**Visual hierarchy.** Apply Gestalt principles — proximity, similarity, common region, figure–ground — so related content reads as grouped and scannable.

**Cognitive load.** Eliminate extraneous load via Sweller's CLT (see Module 1): use worked examples for novices, integrate text with graphics (avoid split attention), prefer narration-plus-visual over text-plus-visual (modality effect), avoid redundancy.

**Dyslexia-friendly formatting (British Dyslexia Association Style Guide, 2023).**

- Sans-serif fonts (Arial, Verdana, Tahoma, Open Sans, Calibri); OpenDyslexic and Lexie Readable are options but controlled studies (Rello & Baeza-Yates, 2013) find no advantage over standard sans-serifs.
- Body 12–14 pt minimum (~16–19 px).
- Line spacing 1.5×; inter-letter spacing ≈35% of average letter width.
- Left-align, ragged right — **never justify**.
- Replace italics and underlines with **bold**; avoid ALL CAPS blocks.
- Off-white/cream backgrounds; avoid pure #FFFFFF for long reading.
- Line length 60–70 characters.

## Visual accessibility

Governed by **WCAG 2.2** (W3C Recommendation, 5 October 2023). Four POUR principles (Perceivable, Operable, Understandable, Robust) × three conformance levels (A, AA, AAA). WCAG 2.2 added nine new criteria including focus appearance (2.4.11), target size (2.5.8), dragging movements (2.5.7), and accessible authentication (3.3.8).

**Color contrast (SC 1.4.3 / 1.4.6 / 1.4.11).**

- AA normal text: **≥ 4.5:1**.
- AA large text (≥ 18 pt, or 14 pt bold): **≥ 3:1**.
- AAA normal text: **≥ 7:1**.
- Non-text UI components and meaningful graphics (1.4.11, AA): **≥ 3:1**.

**Alt text (SC 1.1.1, A).** Decorative images use null `alt=""`; informative images use concise prose conveying meaning, not visual detail. Industry heuristic: ≤ 125 characters. Skip "image of" / "photo of." Complex images (charts, diagrams) get short alt + longer description via adjacent text or `aria-describedby`.

**Screen reader compatibility.** Use semantic HTML first (`<nav>`, `<main>`, headings in hierarchical order, `<button>` not `<div>`-clicked). ARIA only where semantic HTML is insufficient — "no ARIA is better than bad ARIA" (W3C WAI-ARIA Authoring Practices).

**Font sizing.** Body minimum 16 px using relative units; WCAG 1.4.4 requires zoom to 200% without loss of function; 1.4.12 Text Spacing requires adaptation to line-height 1.5×, paragraph spacing 2×, letter-spacing 0.12×, word-spacing 0.16×.

**Color-only cues (SC 1.4.1, A).** Pair colour with icon, text, or pattern. ~8% of men and 0.5% of women have colour vision deficiency (Colour Blind Awareness).

**Captions and transcripts.** SC 1.2.2 captions for prerecorded audio (A); 1.2.4 live captions (AA); 1.2.5 audio description (AA); transcripts for all audio with speaker IDs and sound-effect descriptions.

## Motor accessibility

- **Keyboard navigation** (2.1.1 A; 2.4.3 A; 2.4.7 AA; 2.4.11 AA new in 2.2): every interactive element reachable via Tab, logical order, visible focus indicator ≥ 3:1 contrast, skip link at top (2.4.1 A).
- **Touch targets** (2.5.8 AA new in 2.2): **≥ 24 × 24 CSS px**; AAA (2.5.5): ≥ 44 × 44. Apple HIG: 44 × 44 pt; Material Design: 48 × 48 dp with 8 dp spacing.
- **Timing** (2.2.1 A): timeouts adjustable, extendable, or removable. No auto-advancing content > 5 sec without pause (2.2.2 A).
- **Dragging** (2.5.7 AA new in 2.2): provide single-pointer alternative for every drag. Pointer gestures (2.5.1 A) have single-point alternatives.
- **Hover content** (1.4.13 AA): dismissible (Esc), hoverable, persistent. Never make critical info hover-only.

## Cultural accessibility

Non-native English speakers outnumber native speakers ~5:1 globally (Crystal, 2003, *English as a Global Language*). Design source content for everyone who will encounter it.

- **Avoid idioms, sports/military metaphors, phrasal verbs without alternatives** ("break a leg," "ballpark figure," "turn in" → "submit").
- **Diverse names and imagery** — Aisha, Raj, Mei-Lin, Kwame, Sofía; varied body types, skin tones, abilities, ages, gender presentations, family structures. Use inclusive stock libraries (Disabled And Here, TONL, Nappy).
- **Non-ethnocentric examples** — avoid defaulting to U.S. taxes, holidays, sports, imperial units, MM/DD/YYYY dates, USD currency without explicit context. Dual-label units; ISO 8601 dates or spelled-out months.
- **Religious and dietary neutrality** — "holiday season" not "Christmas season"; neutral food examples (accommodate halal, kosher, vegetarian, vegan audiences); don't assume Sunday is a weekend day.
- **Gender-inclusive language (APA, 2023)** — singular "they"; "chair" not "chairman"; "workforce" not "manpower." Person-first vs identity-first per community preference ("person with diabetes"; "autistic person," "Deaf person").
- **Localization-ready source** — avoid concatenated strings, allow 30% text expansion (German), use Unicode, externalise strings.

## Universal Design for Learning (UDL 3.0)

CAST (2024, *UDL Guidelines v3.0*, udlguidelines.cast.org) — released July 30, 2024 — shifts UDL's goal from "expert learners" to **"learner agency that is purposeful and reflective, resourceful and authentic, strategic and action-oriented."** Version 3.0 adds the *who* of learning (identity/intersectionality), names institutional and systemic biases as barriers, and adds two new considerations per principle.

**Principle 1 — Multiple means of Representation (the *what* of learning; recognition networks).** Perception (customisable display, alternatives for audio/visual), language & symbols (vocabulary, syntax, multi-language), building knowledge (prior knowledge, patterns, transfer).

**Principle 2 — Multiple means of Action & Expression (the *how* of learning; strategic networks).** Interaction (response methods, assistive tech), expression & communication (multiple media and tools, scaffolded practice), strategy development (goal-setting, planning, monitoring).

**Principle 3 — Multiple means of Engagement (the *why* of learning; affective networks).** Welcoming interests & identities (choice, relevance, joy, minimizing threats), sustaining effort & persistence (salience, collaboration, feedback), emotional capacity (beliefs, self-awareness, reflection, empathy).

Meta-analytic support is mixed but directionally positive (Capp, 2017, *Int. J. Inclusive Education*; Ok et al., 2017).

## Building accessibility into AI-generated content

- Include WCAG targets explicitly in the system prompt ("Flesch-Kincaid ≤ 8; active voice; alt text ≤ 125 characters; no idioms; gender-neutral; person-first unless community prefers otherwise").
- For automated alt text: constrain length, prohibit "image of / photo of," pass page context in, and **always human-review** — vision models still hallucinate detail and encode bias (Hanley et al., 2021, AAAI/ACM).
- Gate publishing on automated checks: Hemingway for grade level, alex.js or retext-equality for inclusive-language linting, axe-core for WCAG, contrast checkers for colour.

## Checklists for AI-generated content

**Cognitive:** Grade ≤ 8 · sentences ≤ 20 words avg · active voice > 80% · one idea per paragraph · lists ≤ 5 items · jargon defined on first use · no idioms · worked examples before problems · text and visuals integrated.

**Visual:** informative alt < 125 chars · decorative `alt=""` · contrast ≥ 4.5:1 normal / 3:1 large / 3:1 non-text · no color-only cues · body ≥ 16 px · line height ≥ 1.5 · off-white background · sans-serif · captions on video · transcripts on audio · semantic HTML · NVDA/VoiceOver tested.

**Motor:** keyboard-reachable · visible focus · skip link · targets ≥ 24×24 (AA) / 44×44 (AAA) · 8 px spacing · no hover-only · drag has click alternative · timeouts adjustable · no auto-advance > 5 sec.

**Cultural:** diverse names and imagery · global examples · dual units · ISO dates · no religious defaults · gender-neutral · person-first or identity-first per community · no idioms/sports metaphors · localization-ready strings · native-speaker reviewed where possible.

## Quick reference

- Ship to **WCAG 2.2 AA** as the baseline; treat AAA as aspirational for text contrast and target size.
- Grade 8 reading level, sans-serif 16 px minimum, 4.5:1 contrast.
- Four dimensions: cognitive, visual, motor, cultural — all four tested, not just visual.
- UDL 3.0 gives you the *why* of variability; WCAG gives you the *how* of conformance.
- AI outputs are not accessible by default — constrain in the prompt, verify with tooling, human-review all alt text.

---
