# Rise 360 Code Block constraints

This file is the source of truth for technical reality. Every spec section 12 (technical constraints) and section 13 (tracking and completion) draws from here. LMS-specific rules live in the selected LMS profile (`lms-generic.md` or `lms-docebo.md`).

> **Verify before you rely on this.** The vendor behavior described here was compiled from vendor documentation and community testing in 2025 and 2026. Vendors change products often. Check the current documentation for your tools, and test in your own LMS, before you commit to a build.

## Table of contents

1. Rise 360 Code Block versus Embed block
2. Code Block sandbox model and limits
3. HTML, CSS, and JavaScript support
4. Mobile responsiveness
5. Accessibility constraints inside Code Block
6. SCORM, xAPI, and completion tracking
7. Workarounds and escape hatches
8. Known limitations to bake into every spec
9. Third-party Rise extensions (Mighty)
10. LMS profiles
11. Hard publishing rules for every build

---

## 1. Rise 360 Code Block versus Embed block

Rise 360 has two distinct features that get conflated as "custom code." Treat them as different paths.

**Embed block** (Multimedia → Embed): Pastes a URL or `<iframe>` snippet. Validated through Embedly (600+ providers); raw iframes accepted with strict syntax rules. Content stays externally hosted. Use for embedding existing third-party widgets like Vimeo, Genially, or H5P content hosted elsewhere.

**Code Block** (GA October 7, 2025): In-app HTML, CSS, and JS editor or ZIP upload with `index.html` at root. Code runs in a sandboxed iframe. Content is bundled into the published course.

**Default for this skill: target Code Block exclusively** for new interactive components. Use Embed only when explicitly integrating a pre-existing third-party tool.

---

## 2. Code Block sandbox model and limits

- Code Block runs inside a sandboxed `<iframe>`. Articulate's official prompt template states the `index.html` file is used inside an iframe.
- **ZIP upload limit: 5 GB.** `index.html` must be at the root, exact filename, not in a subfolder.
- **No documented character limit** on inline Code Block content.
- The exact `sandbox=` attribute is undocumented. Observed behavior: scripts run, localStorage works, `window.parent.postMessage` is allowed, blob downloads and file-system writes are blocked, `<a download>` is blocked.
- localStorage persists across blocks (implying `allow-same-origin` is set), useful for cross-block state.
- **Articulate explicitly will not debug custom code.** Their support team does not troubleshoot Code Block contents.

---

## 3. HTML, CSS, and JavaScript support

- Articulate's official guidance: HTML, CSS, and JavaScript work best for custom code blocks.
- Articulate's recommended LLM template explicitly says the `index.html` file should not include external web requests. The default pattern is **self-contained** with no CDN dependencies.
- Community testing shows external resources can work (Google Fonts via `<link>`, ESM imports from jsdelivr) but this is best-effort and unsupported.
- **No CSS scoping** — each block's CSS lives only in that block's iframe. No way to share course-wide CSS across blocks.
- **No access to Rise theme tokens, fonts, or colors** — authors must supply their own.

The skill's default Phase 2 build pattern: single `index.html` with all CSS and JS inlined. No external requests. No CDN.

---

## 4. Mobile responsiveness

- Code Block has Format settings: block padding, content width, max height.
- **Vertical sizing is automatic** — Rise auto-sizes the iframe to content height. Protocol (postMessage or ResizeObserver) is undocumented.
- Authors must write responsive CSS themselves; Rise does not inject viewport meta or breakpoints.
- Articulate's stance on the legacy Embed block was that Rise content reflows by screen size but cannot change the layout of external web content.

Breakpoints to target in every Phase 2 build: 320px (smallest mobile), 768px (tablet), 1024px (desktop).

---

## 5. Accessibility constraints inside Code Block

- Official guidance: Code Block accessibility is determined by the accessibility of the HTML code it contains.
- Rise overall conforms to **WCAG 2.2 AA** per VPAT.
- Code Block iframes now include an accessible name (December 2025 update).
- Authors must avoid keyboard traps; users must be able to Shift+Tab back out to Rise navigation.
- See `accessibility.md` for the full 25-item checklist applied inside the iframe.

---

## 6. SCORM, xAPI, and completion tracking

Rise 360 publishes to xAPI (Tin Can), SCORM 2004, SCORM 1.2, AICC, cmi5, plus Web/PDF/Reach.

**Tracking options at the course level:**
- Track using course completion (% viewed)
- Track using quiz result (score)
- Track using Storyline block (viewed)
- **Tracking by Code Block completion is NOT a documented option.** Code Block completion only fires Rise's internal "Continue" gate; it does not bubble up as a course-level SCORM completion criterion.

**The only documented postMessage hook** (verbatim from Articulate):

```javascript
window.parent.postMessage({ type: 'complete' }, '*');
```

Critical caveat from Articulate: activating the completion toggle and including a completion-based continue block without including the code snippet in the project will block learners from continuing the training. There is **no documented event in the reverse direction** (Rise to block) and no other documented message types.

Every Phase 2 build that uses a completion gate must fire this snippet at the right moment in the interaction.

---

## 7. Workarounds and escape hatches

- **Storyline block as escape hatch** — for blob downloads, complex JS, audio sync. Storyline exposes `GetPlayer()` JS API; Code Block does not.
- **Hidden Storyline trick** (Tom Kuhlmann) — minimum-height Storyline slide with matched background runs JS invisibly.
- **localStorage works across all Rise blocks** because they share the parent domain. Useful for cross-block state (for example `eNotes1`, `eNotes2` per lesson).
- **Slate Patcher** Chrome extension can post-modify SCORM exports with custom CSS or JS.
- **Articulate's dedicated Code Block community group**: https://community.articulate.com/group/code-block

---

## 8. Known limitations to bake into every spec

1. Blob downloads blocked (no FileSaver, no `<a download>`)
2. No file-system access
3. External web requests discouraged; CORS and opaque-origin issues likely
4. No cross-block JS communication except via shared localStorage
5. PDF export of the course does not render Code Block content faithfully
6. **Localization (XLIFF) is not supported** for Code Blocks — translation requires duplicating the block per language
7. Code blocks cannot be previewed locally for LMS exports — must upload to host
8. No documented LMS-level tracking from Code Block (only block completion gate)

---

---

## 9. Third-party Rise extensions (Mighty)

Mighty is a third-party browser extension for authors. It is separate from Rise's native Code Block.

**Author-side only.** Reviewers do not need the extension to view courses.

### Capabilities
- Extended typography (font sizes, line height, letter spacing)
- Custom block transitions
- Reflection block with hint text and PDF download
- Color picker beyond Rise's window; custom palettes and brand colors
- Additional visual and interactive blocks (reflection prompts, custom buttons, multiple-choice variations, transition blocks)
- A custom CSS block that persists across publishes
- Quick sort for course sections
- Google Analytics integration

### What it does not do
It does not advertise variables, conditional logic, or true branching as core features.

### How it handles code
Its custom CSS block bakes CSS into the published `index.html` head at publish time. There is no documented interaction between the extension and the native Code Block.

### Risks
- Author-side subscription: if it lapses, the extension goes read-only (already published courses keep working)
- Chrome and Edge only for authoring
- Third-party risk: a change to Rise's authoring interface could break it
- No public roadmap, and it ships often

### How to treat it
Treat it as a styling and branding power-up, not an interactive-component path. Use Rise's native Code Block for interactive HTML and JavaScript. Use Mighty for visual polish and brand-consistent CSS.

---

## 10. LMS profiles

Every spec names one LMS profile in its front matter (`lms_target`). Read the matching file and apply it in sections 12 and 13:

- `lms-generic.md`: any SCORM, xAPI, or cmi5 LMS, or when the LMS is unknown. This is the default.
- `lms-docebo.md`: Docebo-specific limits, quirks, and migration pitfalls.

---

## 11. Hard publishing rules for every build

These apply to every spec, whatever the LMS:

1. **Bundle all assets.** No external CDN dependencies.
2. **HTTPS only.** Treat any `http://` reference as a build-time error.
3. **No server-side script extensions** (`.php`, `.asp`, `.jsp`, and similar).
4. **Single-SCO packages.** Multi-SCO breaks some offline mobile players.
5. **Send a completion trigger the LMS can record**, and send the LMS commit and finish calls before relying on the window closing.
6. **In SCORM 2004, set both `cmi.completion_status` and `cmi.success_status` explicitly.**
7. **Test in SCORM Cloud before your production LMS.** It is the usual baseline for SCORM conformance.
8. **Test in Chrome and Safari.** Safari's tracking prevention has caused SCORM completion problems.
9. **Do not add, remove, or reorder lessons after launch.** It can break resume for learners who are mid-course.
