# ILT Slide Writing Patterns

ILT slides are projected, narrated, and discussed. The slide is the anchor. The instructor's voice is the lesson. Write both layers.

This file covers the slide-level patterns this skill uses when writing ILT slide content. Pair it with `04-speaker-notes-structure.md` for the speaker notes structure, `01-modern-learning-design-principles.md` for the principle layer, and `05-blooms-alignment-cues.md` for cognitive level matching.

---

## The Slide Philosophy: Assertion-Evidence

This skill writes ILT slides using the **assertion-evidence approach** (Alley, Penn State). The structure:

1. **Slide title is a complete-sentence assertion**, not a topic noun phrase
2. **The body is visual evidence** that supports the assertion (chart, diagram, screenshot, photo)
3. **Bulleted lists are the exception, not the default**

Empirical research (engineering, veterinary, and medical education studies) shows assertion-evidence slides produce better immediate and delayed recall than traditional bullet decks.

**Topic title (weak):**
> Giving Feedback Overview

**Assertion title (strong):**
> Feedback works when it answers one question: what should the person do differently next time?

The assertion does the teaching. The visual lands the proof. The instructor's voice fills in the rest.

---

## Slide Output Format

Write each slide with these labeled sections:

```markdown
## Slide [N] — [Slide Title as Assertion]

**On-slide content**
[Visual evidence and any minimal labels or signaling text]

**Visual:** [Description of what visual goes on the slide]

**Speaker notes**
[Hook → Teach → Check → Transition structure — see 04-speaker-notes-structure.md]
```

The slide title carries the assertion. The visual carries the evidence. The speaker notes carry the lesson.

---

## On-Slide Writing Rules

### Title rules
- **Title is a complete-sentence assertion**, capped at two lines
- States the slide's main claim
- Examples:
  - "Public pushback that gets a public response turns into a public debate."
  - "Three things make feedback land: specificity, timing, and follow-up."
  - "The cost of skipping qualifying compounds with every conversation after."

### Body rules
- **Cap on-slide text at ~30 words.** If you exceed, split the slide or move text to speaker notes.
- **Never duplicate the speaker's words on screen.** Mayer's redundancy principle: when narration and visuals carry the message, on-screen text should be minimal labels and signaling cues only.
- **Bullets are the exception.** Maximum 3-4 short bullets, each under 8 words, only when the content is genuinely a parallel list.
- **No full sentences on slides** unless intentional (a quote, a stake, a definition that must be exact).
- **Signaling rule:** use color, arrows, bolding, or sequential reveals to mark the one element you want the learner to focus on. Never signal more than one thing per slide.

### What goes on the slide
- The assertion title
- A single visual evidence element (diagram, chart, screenshot, photo, icon set)
- Minimal labels on the visual (2-7 word phrases)
- Signaling cues (highlighted element, arrow, color callout)

### What does NOT go on the slide
- The instructor's exact spoken words
- The full explanation
- 6+ bullets
- Decorative imagery
- Throat-clearing ("Welcome to module three")

---

## Slide Type Library

### Section Opener Slide

Marks the start of a new section or topic beat. Sets the stake.

```markdown
## Slide N — Feedback is the cheapest investment a manager makes, and the one most often skipped.

**On-slide content**
[Title + a single image: a calendar with a recurring 1:1 slot highlighted, and the meeting notes blank]

**Visual:** A photo or stylized illustration of a calendar showing a recurring 1:1 meeting slot. The meeting notes section is blank. The visual carries the tension; the title carries the claim.

**Speaker notes**
[See 04-speaker-notes-structure.md for full hook/teach/check/transition structure]
```

**When to use:** Start of every new section or major topic beat in a deck.

---

### Concept Slide (Assertion + Diagram)

The workhorse slide. An assertion title plus a visual that lands the concept.

```markdown
## Slide N — Specific feedback changes behavior; vague feedback feels supportive and changes nothing.

**On-slide content**
[Title + a two-panel diagram]

**Visual:** Two-panel diagram. Left panel: a manager saying "good job" with an arrow to an employee continuing the same behavior. Right panel: a manager saying a specific behavior + impact + ask, with an arrow to an employee changing the behavior. Use a brand accent color on the right-side framework.

**Speaker notes**
[Hook/Teach/Check/Transition...]
```

**When to use:** Most teaching slides. One concept, one assertion, one visual.

---

### Process Slide (Diagram, not bullets)

For sequential processes with 4+ steps. Always a diagram, never a bulleted list.

```markdown
## Slide N — Effective feedback runs in five steps, and step 3 is the one most managers skip.

**On-slide content**
[Title + horizontal arrow diagram, 5 labeled steps]

**Visual:** A 5-step horizontal arrow diagram. Each step is a labeled box: Observe, Impact, Ask, Align, Follow up. Step 3 (Ask) is highlighted in a brand accent color as the focus point.

**Speaker notes**
[Hook/Teach/Check/Transition. Speaker walks through each step but lingers on Ask — that's the highlighted one and the cognitive anchor.]
```

**When to use:** Any process with 4+ steps. Replaces the temptation to write a bulleted list.

---

### Comparison Slide

Side-by-side comparison of two or more options, approaches, or cases.

```markdown
## Slide N — Public praise amplifies values; private praise builds depth.

**On-slide content**
[Title + 2-column comparison table]

**Visual:** Two columns labeled "Public praise" and "Private praise". Each column has 3 rows: When to use, What it signals, Risk of overuse. Cells contain 2-7 word phrases. The "When to use" row has brand accent highlighting on the recommended use case for each.

**Speaker notes**
[Hook/Teach/Check/Transition. Speaker pulls out the contrast: same goal, different mechanism.]
```

**When to use:** Anywhere two options need to be weighed. Especially good for Analyze and Evaluate level objectives.

---

### Demo Slide

A slide that anchors a live software demo. The slide is sparse; the demo is the lesson.

```markdown
## Slide N — Set up a 1:1 agenda template in three clicks.

**On-slide content**
[Title + a screenshot of the meeting tool with the template option highlighted]

**Visual:** Screenshot of the meeting tool's settings screen. The "Create template" button is highlighted with a brand accent callout box. No annotations or arrows beyond the single highlight.

**Speaker notes**
*Hook (15 sec):* "Show of hands: who has walked into a 1:1 without an agenda? [pause]"

*Teach (live demo, 2-3 min):*
[Demo prompt] Walk through the three clicks live in the system:
1. Open the meeting tool's settings
2. Select "Create template"
3. Save and verify the template appears in the next 1:1

[Land the why] An agenda template removes the activation cost. You stop deciding what to talk about and start having the conversation.

*Check (30 sec):* "What's the first item on your template? Turn to your neighbor and decide."

*Transition:* "We just built the template. Now let's talk about what to do when the 1:1 is the only conversation that week."
```

**When to use:** Software demos, configuration walkthroughs, hands-on system content.

---

### Activity Slide

A slide that triggers a learner activity (small group, individual reflection, partner exchange, exercise).

```markdown
## Slide N — You have 5 minutes. Diagnose the stalled deal.

**On-slide content**
[Title + a printed scenario card / handout reference]

**Visual:** Scenario card visual. Includes the deal context, the stakeholder map, the last three meeting notes, and the silence period. The visual is intentionally information-rich because the learner is working off it for 5 minutes.

**Speaker notes**
*Hook (30 sec):* "Open your handout. You've got the same scenario the account team was looking at on Monday morning. Your job: figure out why the deal stalled."

*Teach (set the activity, 1 min):*
[Activity setup]
- Work in pairs
- 5 minutes
- One diagnosis, one piece of supporting evidence
- We'll debrief together

*Check (debrief, 5 min):*
[Debrief prompt] "Pair up with another team. Did you reach the same diagnosis? If not, what evidence did each pair weigh differently?"

*Transition:* "Hold that diagnosis. We're going to test it against the actual root cause on the next slide."
```

**When to use:** Apply, Analyze, or Evaluate objectives where learners need hands-on practice. ILT's biggest advantage over self-paced is the room; activity slides earn their keep.

---

### Closer Slide

The end of a section, topic beat, or full session. Names the application, not the recap.

```markdown
## Slide N — Before your next 1:1 this week, write down one piece of feedback you've been holding back.

**On-slide content**
[Title + a 3-question checklist visual or a job aid graphic]

**Visual:** A simple checklist graphic with 3 questions:
1. What specific behavior?
2. What was the impact?
3. What's the one ask?

**Speaker notes**
*Hook (10 sec):* "If you take one thing back to your desk Monday, take this."

*Teach (1 min):*
[Land the application] These three questions turn vague reactions into useful feedback. Print the job aid. Bring it to your next 1:1.

*Check (30 sec):* "Pick one of the three questions. Tell your neighbor when you'd ask it."

*Transition (or close):* "We've covered the framework, the timing, and the follow-up. Monday morning, you've got a job aid and a habit. That's the takeaway."
```

**Critical rule:** never close a section with a recap. Always close with an application prompt the learner can act on within 24 hours (Principle 4).

**When to use:** End of every section. End of every full ILT session.

---

## Section-Level Structure

A standard ILT section (one topic beat, ~10 minutes of teaching) assembles slides in this order:

1. **Section Opener** — sets the stake
2. **Concept slides** — assertions plus visual evidence (1-3 slides)
3. **Process or Comparison slide** — visualizes the underlying structure
4. **Demo or Activity slide** — hands-on application
5. **Closer slide** — names the 24-hour action

A standard ILT section runs 5-7 slides total. More than 7 in a single beat means the section is two beats.

---

## Common ILT Slide Failures to Avoid

- **Topic-noun titles.** "Feedback Overview." Rewrite as a complete-sentence assertion.
- **Bullet overload.** 6 bullets on a single slide. Replace with a process diagram or a single visual.
- **Wall-of-text slides.** Anything over ~30 words on the slide body. Move to speaker notes or split.
- **Redundancy with narration.** The slide repeats what the instructor will say verbatim. Cut the slide text; trust the speaker.
- **Decorative imagery.** Stock photos of handshakes, lightbulbs, gears. If the visual could be removed without loss, remove it.
- **Generic scenarios.** "Imagine a manager..." Replace with role + situation + stake from the actual audience.
- **Recap closers.** A section ending with "today we covered..." Rewrite as an application prompt.
- **Over-signaling.** Every other word bolded, three highlight colors, multiple arrows. Pick one element to signal per slide.
- **Multi-objective sections.** A single slide cluster trying to teach two things. Split.

---

## Presenter Slide vs. Participant-Facing Slide

There's a meaningful distinction:

- **Presenter slide:** sparse, asserts one point, leans on the speaker. Most ILT slides are presenter slides.
- **Participant-facing slide (slidedoc, takeaway, virtual session where the slide must stand alone):** carries more text and labeled visuals. Treat it as a different artifact entirely.

If the deck has to function both as a teaching aid and as a takeaway, the right answer is usually two artifacts: the presenter deck and a separate slidedoc or job aid. Don't try to make one slide do both jobs.

---

## When to Hand Off to Other Skills

- **Style guide enforcement:** after content is written, hand off to `style-guide-enforcer` for a style guide pass.
- **Conversion to self-paced:** if the ILT content needs a self-paced version, this skill can write the Rise 360 version directly. Use Format A patterns.
- **Assessment items:** for formal certification questions, hand off to `cert-item-writer`.
