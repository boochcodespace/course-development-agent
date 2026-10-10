# The 16-section spec template

This is the canonical template every spec produced by this skill follows. The structure is non-negotiable: do not add, remove, or reorder sections. Inline comments in the template explain what each section requires.

When generating a spec, copy this template verbatim and fill in every section. Do not leave any section blank — if a section does not apply, write "Not applicable" with one sentence of justification.

After filling in the template, run the design principles audit (Step 5 of the workflow) before saving and presenting.

---

## Template

````markdown
---
component_id: RISE-XXX                # Stable ID; matches asset folder name. Use kebab-case slug.
component_name: <Sentence-case title> # Follow the active style guide
version: 0.1.0                        # SemVer; bump on any contract change
status: draft                         # draft | review | approved | built
author: <author name>
last_updated: YYYY-MM-DD
authoring_tool: Rise 360 Code Block
lms_target: <generic | docebo | other>
publish_format: <SCORM 2004 3rd Edition | SCORM 1.2 | xAPI | cmi5>
estimated_duration_minutes: <1-10>
interaction_type: <one of the 8 patterns>
---

# 1. Summary

<!--
One sentence: what this component is and the single learner outcome it produces.
Include estimated completion time (must be 10 minutes or less).
-->

# 2. Learning objective

<!--
Exactly ONE measurable objective using a Bloom's verb at Apply or higher
(Apply, Analyze, Evaluate, Create).

Format: "By the end of this component, the learner will be able to [verb] [object] [condition]."

Reject: understand, learn, know, appreciate, be familiar with, be aware of.

If you have multiple objectives, you have multiple components.
-->

# 3. Learner persona and context

<!--
Format: "As a [role] who [context], I need to [behavior] so that [business outcome]."

The role must be specific (support agent handling an escalated refund; regional sales manager
reviewing a forecast; partner solution architect) — not "user" or "learner."

The business outcome must be observable on the job, not "complete the training."

If applying default persona for Consultant / Customer / Partner audience, note which.
-->

# 4. Hook (first 30 seconds)

<!--
Verbatim opening copy. 1 to 3 sentences, 10 to 30 seconds of read or listen time.
Domain-credible problem that opens an information gap the artifact will close.

Reject openings that lead with logo, table of contents, or learning-objective bullets.

Apply curiosity gap principle (see learning-science.md §7).
-->

# 5. Component anatomy

<!--
Bulleted list of every visible part, top to bottom.

If the layout is non-trivial, include an ASCII diagram or Mermaid layout.

Each item should be one chunk; if any screen has more than 5 chunks, segment.
-->

# 6. Interaction model (states and transitions)

<!--
Table of every state in the interaction:

| State | Trigger to enter | What learner sees | Exit condition |
|-------|------------------|-------------------|----------------|
| ...   | ...              | ...               | ...            |

The final state must be a decision, scenario, or applied task — not a recall quiz.
Note duration estimate per state; total must be 10 minutes or less.
-->

# 7. Content and copy (verbatim)

<!--
Every string the learner will see, in final form. Apply the active style guide
strictly (it is supplied in the prompt). Always:
- Write in second person and active voice
- Keep one idea per sentence

Format as a table:

| ID | Location | Exact copy |
|----|----------|------------|
| C1 | Hook headline | ... |
| C2 | Submit button | Submit answer |
| C3 | Feedback (correct, item 1) | ... |
| ... | ... | ... |

Include feedback messages for every possible learner action.
-->

# 8. Branching and flow (if interactive)

<!--
For branching scenarios, scenario simulators, or decision trees:

Twine-style passage list:
- Passage A: <description>; choices lead to B, C, or D
- Passage B: <description>; ...

Plus a Mermaid flowchart of the full flow.

For non-branching components, write "Single linear flow" with a brief description.

This section also tags the concepts taught (for spaced repetition awareness):
- Concepts: <comma-separated list>
- Place in spacing schedule: <e.g., "Week 1 of the refund rules sequence; reinforced in Module 4 capstone">
-->

# 9. Visual design

<!--
The mandatory visual anchor (every spec specifies one).

- Anchor visual: <description>
- Purpose: <how this visual encodes meaning tied to the learning objective>
- Placement: <where it sits in the layout>
- Format: <SVG schematic / annotated screenshot / process flowchart / etc.>
- Caption (one-line "what this shows"): <text>

Reference the brand tokens the user supplied by variable name (--brand-primary, etc.).
Do not hardcode color or font values.

Reject decorative stock photos, unrelated mood imagery, decorative animation.
-->

# 10. Feedback design

<!--
For every learner action that produces a response:

| Trigger | Feedback type | Exact copy | Visual or audio | Flow effect |
|---------|---------------|------------|-----------------|-------------|
| ...     | ...           | ...        | ...             | ...         |

Apply feedback principles:
- Show consequences, do not tell ("the plan now shows a 12% gap")
- Avoid platitudinal "Good job!"
- Defer correctness feedback until learner submits complete answer
- Always provide retry and reset
- Explain consequence of wrong choices, not just correctness
- For novices: immediate corrective feedback
- For experts: delayed feedback acceptable
-->

# 11. Accessibility requirements

<!--
Copy the relevant subset of the 25-item enforcement checklist from accessibility.md
and customize for the chosen interaction type.

At minimum, address:
- Semantic HTML used (list specific elements)
- Keyboard pattern (specific to interaction type)
- ARIA roles and states (specific to interaction type)
- Live region declared and announces what
- Focus management on navigation events
- Color contrast verified at 4.5:1 text and 3:1 UI
- Color is not the only conveyor of meaning
- Touch targets at least 24x24 (44x44 preferred for mobile)
- prefers-reduced-motion honored
- Alt text approach for images and graphics
- Screen reader testing requirements
- Keyboard-only testing requirements
- 200% zoom and 320px viewport tested
-->

# 12. Technical constraints

<!--
Rise 360 Code Block reality:
- Sandboxed iframe (postMessage allowed; blob downloads blocked)
- HTML, CSS, JS only (no server-side, no PHP/ASP/JSP)
- Self-contained: no external CDN dependencies
- HTTPS only for any referenced asset
- ZIP under 5 GB; index.html at root
- body { background: transparent }
- No external web requests
- localStorage available (persists across blocks via shared parent domain)
- Blob downloads blocked; <a download> blocked
- Mobile responsive (breakpoints: 320, 768, 1024)
- Auto-sized iframe (vertical sizing automatic)

Mighty plugin notes:
- If using Mighty Custom CSS block for theming, Mighty subscription is required for re-publish
- Mighty does not affect Code Block content directly

LMS notes (use the selected LMS profile):
- HTTPS only
- No server-side script extensions (.php, .asp, and similar)
- Single SCO (multi-SCO breaks some offline mobile players)
-->

# 13. Tracking and completion

<!--
Default publish format: follow the selected LMS profile. With no profile, use SCORM 2004 3rd Edition where the LMS supports it, and confirm support for any other edition.

Completion trigger:
```javascript
window.parent.postMessage({ type: 'complete' }, '*');
```

Fired when: <specific learner action — e.g., "learner submits final scenario decision and views consequence screen">

Score reporting (if applicable):
- Score variable: <e.g., "items correctly placed out of total">
- Pass threshold: <e.g., "5 of 6 = pass">
- Reported via: <e.g., "Rise quiz block downstream of this code block, OR not reported (gate only)">

xAPI statements emitted (if any): <list, or "none">

Resume behavior expected:
- localStorage state saved on every transition: <yes / no>
- Resume restores: <which states>
- Reset option available: <yes / no>

Concept tags for spaced repetition awareness:
- <comma-separated list>
-->

# 14. Acceptance criteria (Definition of Done)

<!--
Pass/fail bullets and Given/When/Then for interactive flows.

Universal criteria (apply to every spec):
- [ ] Copy matches Section 7 verbatim
- [ ] Component passes axe with zero AA violations
- [ ] Tested in SCORM Cloud BEFORE the production LMS
- [ ] Tested on Chrome, Safari, Edge, iOS Safari, Android Chrome
- [ ] Tested with NVDA+Firefox AND VoiceOver+Safari
- [ ] Keyboard-only tested (mouse unplugged)
- [ ] 200% zoom tested
- [ ] 320px viewport tested
- [ ] prefers-reduced-motion honored
- [ ] Completion postMessage fires at correct moment
- [ ] localStorage state saved and restored on resume

Component-specific Given/When/Then (for branching, drag-drop, sortable, etc.):

Given <starting state>
When <learner action>
Then <expected outcome>

Add as many G/W/T as needed to cover the interaction's primary paths.
-->

# 15. Edge cases and error states

<!--
Address each:
- Skip ahead and revisit (does state persist?)
- Network drop (does the artifact degrade gracefully?)
- Partial completion plus resume (does the learner come back to where they left off?)
- Invalid input (drag to wrong zone, premature submit, etc.)
- LMS connection failure (does completion still fire when connection recovers?)
- Audio or video fails (does interaction still work?)
- iOS Safari Cross-Site Tracking enabled (does completion still write to LMS?)
- Reload mid-interaction
- Browser back button mid-interaction
-->

# 16. Asset list

<!--
Every external asset (image, audio, video, font) bundled with the component.

| Asset ID | Type | Filename | Specs | Source / License | Alt text |
|----------|------|----------|-------|------------------|----------|
| A1 | Image | dashboard-hero.svg | SVG, scalable | Created by the author | Accuracy panel showing 3 scenarios |
| ... | ... | ... | ... | ... | ... |

Note: bundle all assets in the Code Block ZIP. No external URLs.
-->

---

## Out of scope

<!--
Explicitly list what this component does NOT do.

Examples:
- Does not cover advanced refund rule edge cases (deferred to Module 5)
- Does not assess strategic-level policy decisions (this is procedural only)
- Does not integrate with the customer's actual sandbox (uses pre-baked scenarios)
-->

## Open questions

<!--
Anything ambiguous to resolve before build.

Examples:
- Confirm whether the order surge scenario uses the specialist persona or the end-user persona
- Confirm brand color tokens (none were supplied)
-->

## Change log

<!--
| Date | Author | Change |
|------|--------|--------|
| YYYY-MM-DD | <author> | Initial draft |
| ... | ... | ... |
-->
````

---

## Filling out the template: rules

1. **Front matter is mandatory.** All YAML keys must be filled. The `component_id` is the stable identifier — for example `RISE-refund-rules-sort` for a refund rules sortable.

2. **Every section is filled.** No empty sections. If a section does not apply, write "Not applicable" with one sentence of justification.

3. **Section order is fixed.** Do not move sections. The template ordering follows: intent → context → structure → behavior → content → flow → visuals → feedback → accessibility → tech → tracking → DoD → edges → assets.

4. **Section 7 is the verbatim copy contract.** The Phase 2 build (and any developer or AI implementer) treats Section 7 as the source of truth for every string. If the copy needs to change, change it in Section 7 first.

5. **Section 14 is the verification anchor.** Every "must work" claim in the spec needs a corresponding acceptance criterion.

6. **Cross-reference brand tokens by variable name only.** Do not hardcode hex values, font names, or pixel sizes that the user supplied as tokens. If no tokens were supplied, use placeholder names such as `--brand-primary` and add "Needs brand tokens" to Open Questions.
