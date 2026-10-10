# Rise 360 Writing Patterns

Rise lessons are read on screen, not narrated. Every word matters. Learners scroll, scan, and tap. Write accordingly.

This file covers the block-level patterns this skill uses when writing Rise 360 content. Pair it with `01-modern-learning-design-principles.md` and the Bloom's level from the outline.

---

## Rise Voice and Sentence-Level Rules

These rules apply across every block type:

- **Second person, present tense, active voice.** Default to "you." Reserve "we" for solidarity moments.
- **Sentence length: 12-18 words on average.** Tighter than self-paced text. Trim anything over 25.
- **Active voice in 90%+ of sentences.** "The reviewer approves the request," not "the request is approved by the reviewer."
- **Conversational, not corporate.** No "leverage," "robust," "best-in-class," "synergy," "dive deep," "let's explore," "in this lesson, we will."
- **One idea per paragraph.** If you can't underline the single idea, the paragraph is two paragraphs in one. Split.
- **No "you've completed this lesson."** No "click next to continue."

**Plain language is the standard.** Cut throat-clearing ("It is important to note that..."). Cut hedging stacks ("It is generally considered that, in many cases..."). Hedge once or not at all.

---

## Rise Block Output Format

Write Rise content as a sequence of **labeled blocks** that map to Rise 360 block types. Each block is one cognitive chunk.

```markdown
### Block 1 — [Block type]
[Block content]

### Block 2 — [Block type]
[Block content]
```

Use the block type names below. The lesson builder pastes content into the matching Rise 360 block.

---

## Block Library

### Statement (Hook block)

A short, attention-earning sentence or two. Used at the very top of a lesson to land the hook.

```markdown
### Block 1 — Statement
Your direct report just submitted work that's almost good enough. You can ship it as-is, or you can have the conversation that makes the next one better.
```

**Length:** 1-2 sentences, ~30 words max.

**When to use:** Top of every lesson. The hook is non-negotiable (Principle 2).

---

### Heading + Paragraph (Teach block)

The workhorse block. A short heading with a 2-4 sentence body that teaches one concept.

```markdown
### Block 2 — Heading + Paragraph
**Good feedback answers one question**

What should the person do differently next time? If your feedback doesn't answer that, it's not feedback. It's commentary. Commentary feels supportive in the moment and changes nothing.
```

**Length:** 2-4 short sentences in the body. Heading is a complete-thought phrase, not a label.

**When to use:** Most teaching content lives here.

---

### Image + Text (Visual anchor block)

The mandatory visual block. Describes what the visual should depict and pairs it with text that adds information the visual cannot carry.

```markdown
### Block 3 — Image + Text
**Visual:** A two-panel diagram. Left panel shows a vague feedback loop ("good job" → unclear adjustment). Right panel shows a specific feedback loop (behavior + impact + ask → clear adjustment). Use a brand accent color to highlight the "behavior + impact + ask" element on the right.

**Text:** Notice that the only difference is specificity. The framework on the right doesn't take longer. It just takes more thought before you open your mouth.
```

**Length:** Visual instruction is as detailed as needed for a designer to build it. Text is 1-3 sentences that interpret one element of the visual.

**Critical rule (dual coding):** the text adds information the visual cannot carry. A visual of a manager talking plus text that says "managers talk to their teams" is wasted dual coding. The text should interpret, not duplicate.

**When to use:** Every Rise lesson must include at least one visual anchor (Principle 7).

---

### Process (Diagram block)

For sequential content with 4+ steps. Replaces a bulleted list with a numbered visual instruction.

```markdown
### Block 4 — Process
**Visual:** A 5-step horizontal arrow diagram. Each step is a labeled box.

1. **Observe** — name the specific behavior, not the trait
2. **Impact** — describe what the behavior caused
3. **Ask** — invite the person's perspective
4. **Align** — agree on the change
5. **Follow up** — close the loop in the next 1:1

**Text:** Step 3 is the one most people skip. Skipping it turns feedback into a verdict.
```

**Length:** 4-7 steps. More than 7 means the process should be split.

**When to use:** Anything sequential with more than 3 steps. Process diagrams beat bulleted lists every time (assertion-evidence research).

---

### Tabs / Accordions (Reveal blocks)

For grouped content the learner explores in any order. Tabs work for parallel categories (3-5 items). Accordions work for hierarchical or "click to expand" content.

```markdown
### Block 5 — Tabs
**Tab 1: Public praise**
Use it when the work or behavior reflects a value the team should see modeled. Public praise is amplification, not just recognition.

**Tab 2: Private praise**
Use it when the recognition is personal, role-specific, or might embarrass the recipient if shared. Private praise is depth, not secrecy.

**Tab 3: Course-correct feedback**
Always private. Always specific. Always close the loop in the next 1:1.
```

**Length per tab:** 2-4 sentences. Each tab teaches one parallel idea.

**When to use:** Parallel options, comparisons, or "pick your path" content.

---

### Flip Card (Reveal block)

For paired content (term/definition, question/answer, situation/decision). Front is the prompt; back is the payoff.

```markdown
### Block 6 — Flip Card
**Front:** A team member pushes back on a decision in a public channel. Address it publicly, or take it private?

**Back:** Take it private. Public pushback that gets a public response turns into a debate. Private response sets the tone that disagreement is welcome, but the channel isn't the venue.
```

**Length:** Front and back each fit on a single card. Aim for under 30 words per side.

**When to use:** Recall (Remember level), term/definition, quick decision practice.

---

### Knowledge Check (Quiz block)

A formative check inside the lesson. Multiple choice, multiple select, or scenario-style.

```markdown
### Block 7 — Knowledge Check
**Question:** A direct report submits work that's 80% there. You're under deadline. What's the most useful first move?

**Options:**
- A. Fix it yourself this time and send the feedback after the deadline
- B. Send it back with a list of changes
- C. Have a 10-minute conversation about the gap before deciding what to do ✓
- D. Approve it and add the feedback to your next 1:1 agenda

**Feedback (correct):** Right. The 10-minute conversation costs less than the rework cycle and teaches the person what "ready" looks like. The deadline pressure is real, but skipping the conversation guarantees a repeat next time.

**Feedback (incorrect):** Not quite. Each of these moves something forward, but only one of them invests in the next deliverable being better. Look at the long-term cost, not just the deadline cost.
```

**Critical rule (Principle 6):** feedback is consequence-driven, not "correct/incorrect." Tell the learner what their answer means in the situation, not just whether they got it right.

**When to use:** End of a teaching segment, before moving to a new concept. Match the question to the Bloom's level of the objective (see `05-blooms-alignment-cues.md`).

---

### Scenario (Decision block)

A multi-step scenario where the learner makes a decision and sees the consequence. Closer to a branching mini-story than a quiz.

```markdown
### Block 8 — Scenario

**Setup:** Friday afternoon. Your most senior team member just pushed back on a project decision in the team channel. Five other people watched it happen. You have the weekend to figure out how to respond.

**Decision 1:** What's your first move?
- A. Respond in the channel before end of day so the team sees you handle it
- B. DM the senior team member and ask for a 15-minute conversation Monday morning
- C. Let it sit; address it in the next team meeting
- D. Ask your manager for advice before doing anything

**Consequence A:** You respond in the channel. The conversation goes 12 messages deep. Two other team members chime in. By Monday, the original decision is up for renegotiation and your authority on it has eroded. Lesson: public pushback that gets a public response turns into a public debate.

[Continue with Decision 2 from a different starting point...]
```

**Length:** 2-4 decision points. More than 4 turns into a course, not a scenario block.

**When to use:** Apply, Analyze, or Evaluate level objectives. Scenarios are the strongest format for transferring skills to the job.

---

### Statement (Closer block)

The closing application prompt. Names what the learner does within 24 hours of finishing.

```markdown
### Block 9 — Statement
Before your next 1:1 this week, write down one piece of feedback you've been holding back. Bring it. Job aid below.
```

**Critical rule:** never close with a recap (Principle 4). Always close with an action.

**When to use:** Final block of every Rise lesson.

---

## Lesson-Level Structure

A standard Rise lesson assembles the blocks in this order:

1. **Hook** — Statement block (Principle 2)
2. **Teach** — Heading + Paragraph and Image + Text blocks (Principle 3, sentence-level discipline)
3. **Show** — Process or scenario blocks where the concept lands visually
4. **Practice** — Knowledge Check or Scenario block (matched to Bloom's level)
5. **Apply** — Statement block with a 24-hour action (Principle 4)

A standard Rise lesson runs 5-9 blocks total. More than 9 means the lesson is two lessons.

---

## Visual Instruction Standards

Every visual instruction in this skill follows the same format:

```markdown
**Visual:** [Type of visual] — [What it depicts] — [Specific elements] — [Brand or styling note if relevant]
```

**Strong examples:**
- "Two-panel diagram. Left: vague feedback loop. Right: specific feedback loop with behavior + impact + ask. Brand accent color highlights the framework on the right."
- "Screenshot of the project dashboard with the priority filter highlighted."
- "Horizontal arrow diagram, 5 steps, each labeled with a verb (observe, impact, ask, align, follow up)."

**Weak examples (rewrite these):**
- "An image of a meeting." (no specifics)
- "A picture of a manager." (decorative, not earned)
- "A diagram of the process." (which process, what view, what's labeled?)

The "earned placement" test: if removing the visual would not be missed, remove it. If you keep it, the on-page text must reference what the visual shows (Principle 7 + dual coding).

---

## Common Rise Failures to Avoid

- **Wall-of-text blocks.** Heading + Paragraph blocks with 6+ sentences. Split.
- **Decorative imagery.** Stock photos that don't carry concept information. Remove.
- **"Click next" closings.** No call to action, no application prompt. Rewrite the closer.
- **Generic scenarios.** "Imagine a manager has asked you..." Replace with role + situation + stake.
- **Correct/incorrect feedback.** "That's wrong. Try again." Rewrite as the consequence in the story.
- **Multi-objective lessons.** A single Rise lesson teaching three things. Split into three lessons.
- **Long sentences.** Anything over 25 words. Trim.
- **Throat-clearing.** "In this lesson, we will explore the important topic of..." Delete.

---

## When to Hand Off to `rise-interactive-spec`

This skill writes content for **standard Rise 360 blocks** — the blocks listed above plus minor variants. If a lesson needs a custom interactive component beyond what Rise's stock blocks support (a drag-and-drop activity, a complex branching scenario, a custom decision tree, a click-to-reveal hotspot diagram), hand off to `rise-interactive-spec` for the custom code block specification.

Indicators that a custom block is needed:
- The interaction can't be modeled as a tab, accordion, flip card, or knowledge check
- The activity needs branching logic beyond a single decision
- The visual is interactive, not static (zoomable, draggable, sortable)
- The lesson requires gamification mechanics Rise doesn't support natively
