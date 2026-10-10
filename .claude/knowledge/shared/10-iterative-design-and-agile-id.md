# Iterative Design and Agile Instructional Design

Traditional ADDIE treats a course like a bridge: plan everything, then build once. Modern learning content, especially AI-generated content, behaves nothing like a bridge. It behaves like software: discover, prototype, ship, learn, iterate. This module covers the agile/iterative alternatives to waterfall ID and, critically, how those methods apply inside an AI-powered content generation pipeline.

## Why ADDIE alone isn't enough

**ADDIE** traces to **Branson et al. (1975)**, *Interservice Procedures for Instructional Systems Development*, developed at Florida State University for the U.S. Army. The 1975 document actually uses "Analyze, Design, Develop, Implement, **Control**", the ADDIE acronym emerged later (Molenda, 2015). Executed as a linear waterfall, ADDIE has real costs: late-stage feedback is catastrophically expensive, learner voice arrives after everything is built, and the world changes between Analyze and Implement.

**Dick, Carey, and Carey's Systematic Design of Instruction** (originally 1978, now in its 9th edition, Pearson) is more granular, ten interrelated components including criterion-referenced assessment design *before* content, and explicitly includes formative evaluation loops. It is iterative in principle, often waterfall in practice.

The iterative alternatives respond to the same problem: *we learn most when we put an artifact in front of a real learner, and we want to do that early and often.*

## SAM: the Successive Approximation Model

**Allen and Sites (2012)**, *Leaving ADDIE for SAM: An Agile Model for Developing the Best Learning Experiences* (ASTD Press), is the most widely adopted iterative ID framework.

### SAM1 vs. SAM2

**SAM1** is a three-phase iterative loop, **Evaluate → Design → Develop**: appropriate for small projects. Essentially the Savvy Start pattern repeated until done.

**SAM2** is the extended model for larger projects:

1. **Preparation.** Information Gathering → **Savvy Start**.
2. **Iterative Design.** Project Planning → Additional Design.
3. **Iterative Development.** Design Proof → **Alpha → Beta → Gold**.

### The Savvy Start

A structured brainstorming kickoff that brings the design team and stakeholders, designer, SME, project financier, performance supervisor, and at least one prospective learner, together for a half-day to a few days. The team reviews background information and generates initial prototype ideas, designing *backward from advanced skills*. Analysis is ongoing, not front-loaded. The Savvy Start replaces the months-long analyze-and-design phase of ADDIE with a compressed, collaborative working session that produces prototypes on day one.

### Alpha, Beta, Gold release cycle

| Gate | State | Review focus |
|---|---|---|
| **Alpha** | First functional release; expected to contain errors | Function, flow, pedagogical alignment; triggers validation cycle |
| **Beta** | Alpha + evaluation fixes; first Gold-release candidate | No functional errors; learner testing; accessibility and Bloom audits |
| **Gold** | Final, approved release | Ship-ready; minor copy edits only |

> **Design Tip, Never let Beta become Gold by default.** A dedicated validation cycle between Alpha and Beta is the single most valuable gate in SAM. Teams that skip it ship buggy content and call it "done."

## Related iterative frameworks worth knowing

**Rapid prototyping in ID.** **Tripp and Bichelmeyer (1990)**, "Rapid prototyping: An alternative instructional design strategy," *ETR&D*, 38(1), 31–44. Argued, ahead of its time, that RP from software engineering applies to ID because of the structural similarity between software and instructional design. The foundation document for nearly everything that followed.

**Agile values applied to ID.** The 2001 Agile Manifesto's four values translate directly: individuals and interactions over processes and tools; **working learning artifacts over comprehensive documentation**; **learner and stakeholder collaboration over contract negotiation**; responding to change over following a plan.

**Scrum and Kanban for ID teams.** Short sprints (1–2 weeks), a prioritized course backlog, a clear *definition of done* for each artifact (e.g., "storyboard = all 12 fields complete, SME signed off, accessibility notes present, linked to objective"), and retrospectives after each sprint. **Megan Torrance's LLAMA** method, *Lot Like Agile Management Approach*, TorranceLearning, is the best-known practitioner adaptation (Torrance, 2019, *Agile for Instructional Designers: Iterative Project Management to Achieve Results*, ATD Press). LLAMA emphasizes a design-thinking-inspired project ignition, user stories, prioritization by threshold/target/future, and "zero surprises" weekly stakeholder communication.

**Lean UX applied to learning.** **Gothelf and Seiden** (O'Reilly, 1st ed. 2013; 2nd 2016; 3rd 2021) anchor the approach: outcomes over outputs, **assumption mapping**, **hypothesis statements** ("We believe [outcome] will be achieved if [audience] attains [measurable change] with [feature]"), the Lean UX Canvas, and the Build–Measure–Learn loop applied to learning products.

**MVLP, Minimum Viable Learning Product.** Practitioner definitions vary (Andrada, 2016; Niles-Hofmann, 2016; Hardman; Fruhling), but they converge on: *the smallest, fastest-to-ship learning intervention that delivers measurable value to a core learner audience and enables validated learning about what works before scaling.* Often a single well-designed micro-lesson or job aid, not a full curriculum. Hardman recommends inverting the traditional 80% content / 10% practice / 10% feedback to roughly **10 / 80 / 10**.

## Rapid prototyping techniques for eLearning

- **Paper prototyping.** Before any authoring tool. Sticky notes, index cards, pencil sketches. Forces focus on flow.
- **Lo-fi storyboards.** Text-first in Word or Docs, or visual in PowerPoint. Cheap to throw away.
- **Clickable wireframes.** Figma, PowerPoint with hyperlinks, Miro, or a Twine prototype. Enough interactivity to validate flow without building the final asset.
- **Think-aloud testing.** Grounded in **Ericsson and Simon (1984/1993)**, *Protocol Analysis: Verbal Reports as Data*, MIT Press. Instruct learners to "keep talking" without explaining or justifying; concurrent verbalization is largely non-reactive when done correctly. First-click tests (does the learner hit the right element within 3 seconds?) and comprehension checks at prototype stage catch 80% of usability and pedagogical problems early.
- **SME review cycles.** Show an SME a storyboard, not a finished course. Ask targeted questions ("Is this decision authentic to the job?") rather than "What do you think?" Time-box review windows so the project does not stall.

## Applying iterative design inside the AI content generation pipeline

This is where modern ID and AI tooling fuse. **Treat every AI-generated artifact as a rapid prototype**: the first pass is Alpha, never Gold.

### The core iteration loop

```
Generate → Critic → Revise → Human Review → Approve
```

Each arrow is auditable. Each stage has a different prompt, a different reviewer (model or human), and a different definition of done.

This pattern maps to the 2023 LLM research literature:

- **Self-Refine** (Madaan et al., 2023, NeurIPS; arXiv 2303.17651). A single LLM acts as generator, feedback provider, and refiner in a FEEDBACK → REFINE loop, max ~4 iterations, no training required. ~20% absolute average improvement across 7 tasks using only few-shot prompts.
- **Reflexion** (Shinn et al., 2023, NeurIPS; arXiv 2303.11366). Three modules, Actor, Evaluator, Self-Reflection, with verbal reflections stored in episodic memory and fed to the next attempt. Strong gains on decision-making, coding, and reasoning tasks.
- **Constitutional AI** (Anthropic, 2022). The model critiques and revises its own output against a set of principles.

The practitioner translation for learning content: generate a draft, have the model critique it against your rubric/framework, revise, then send to a human reviewer. The human is last, not first, because the model handles structural and surface issues more efficiently than any reviewer can.

### Building critique prompts that actually improve output

Vague "improve this" prompts produce vague improvements. Effective critique prompts share four features: a **named framework**, a **named learner persona**, **actionable localized feedback** (name the exact line and fix), and an **explicit stopping criterion**.

> **Prompt Tip, Critique prompt template.**
> ```
> ROLE: Expert instructional designer reviewing a draft learning asset.
> CONTEXT:
> - Learner persona: {role, prior knowledge, context of use}
> - Performance objective (Mager ABCD): {audience, behavior, condition, degree}
> - Modality & time: {e.g., 7-min async microlearning}
> - Framework lens: {Merrill / Gagné / Mayer / 4C/ID}
> DRAFT: {paste}
> TASK: Produce a structured critique with three sections:
> 1) ALIGNMENT, Does the draft measurably advance the objective for this persona? Cite specific lines.
> 2) ISSUES, Up to 5 problems. For each: exact location, why it fails (cite framework), severity (blocker/major/minor).
> 3) REVISION DIRECTIVES, Specific, testable instructions the author can act on in Iteration 2.
> CONSTRAINTS: Do NOT rewrite. Flag assumptions. List unanswered questions.
> ```

### Multi-turn refinement strategies

Plan refinement as a scripted conversation, not a single prompt:

1. Generator produces draft.
2. Critic produces structured critique (rubric-scored).
3. Refiner applies directives.
4. Critic re-scores; if any criterion < 4/5, loop, but cap at 3 iterations.
5. Human reviewer sees only the passing draft.

### When to iterate vs. regenerate from scratch

Iterate when the **structure is right** (correct format, correct objectives, correct scaffolds) but **execution is off** (clunky VO, weak example, missing accessibility note). Regenerate when the **structure is wrong** (mis-scoped, mis-leveled Bloom, wrong persona, off-brief). Three unproductive iterations is a signal to regenerate with a better system prompt, not a signal to iterate a fourth time.

### Version control for AI-generated content

Every AI-generated artifact should carry metadata: source prompt ID, model version, generation timestamp, parent version, reviewer, gate status (Alpha/Beta/Gold). When a learner reports a bug six months later, you need to be able to reproduce the exact prompt and model state.

### SME review workflows for AI content

Not everything needs a human. Accessibility conformance, reading-level checks, Bloom-verb alignment, and rubric-score gates can be auto-validated. **Pedagogical authenticity, factual accuracy in regulated domains, and brand voice require human eyes.** Design the SME review brief to surface only what the model cannot self-validate.

> **Design Tip, Build an MVLP, not a curriculum.** Ship one well-designed tapas artifact to real learners in week 2. Measure. Iterate. Compare to the six-month curriculum your competitor is still scoping.

> **Design Tip, Design assessments before content.** The Dick & Carey discipline prevents content bloat in human-authored work and hallucination drift in AI-authored work.

> **Design Tip, Prioritize backlogs by threshold/target/future.** Protect threshold scope, flex on "future" items. Makes timeline changes graceful (Torrance, LLAMA).

> **Prompt Tip, Separate generator, critic, and refiner.** Three prompts, not one. Self-Refine shows this outperforms a single "give me a good answer" prompt by roughly 20% across diverse tasks (Madaan et al., 2023).

> **Prompt Tip, Store a lessons-learned memory.** After each iteration, append a 3–5 bullet reflection ("what went wrong, what to try next") to the prompt context for the next iteration (Reflexion pattern).

> **Prompt Tip, Set an explicit stopping criterion.** "Stop when rubric score ≥ 4 on every criterion, or at iteration 3." Prevents infinite loops and quality drift.

## Quality gates and definition of done

For each tapas content type, define what Alpha, Beta, and Gold require. Example for a micro-lesson:

| Criterion | Alpha | Beta | Gold |
|---|---|---|---|
| Objective alignment | Drafted | SME-verified | Locked |
| Content draft | Present | Copy-edited | Final |
| Assessment items | Drafted | Validated against objective | Locked |
| Scaffolds (worked example, practice) | Present | Faded structure validated | Locked |
| Accessibility (alt text, captions, contrast, keyboard nav) | Noted | All present and checked | WCAG AA confirmed |
| Bloom-level alignment audit | Self-audit | Formal audit | Signed off |
| Learner validation | None required | Think-aloud with 3+ learners | Feedback incorporated |
| Brand/voice | Noted | Checked | Locked |
| Version metadata | Captured | Captured | Captured |

Accessibility is checked at every gate, not only at Gold. Bloom-level alignment audits catch the single most common AI failure: content that claims to target "analyze" but measures "recall." Learner validation at Beta, minimum, never ship a Gold asset no learner has touched.

## Quick Reference: Iterative and Agile ID

- **ADDIE caveat:** the 1975 IPISD model uses "Control," not "Evaluate"; the acronym came later (Molenda, 2015). Waterfall ADDIE is the antipattern.
- **SAM** (Allen & Sites, 2012): Savvy Start → Iterative Design → Iterative Development; Alpha → Beta → Gold.
- **LLAMA** (Torrance, 2019): user stories, prioritized backlog, threshold/target/future, zero surprises.
- **Lean UX** (Gothelf & Seiden): outcomes over outputs, assumption mapping, hypothesis statements, MVP.
- **MVLP:** smallest shippable intervention that delivers measurable value and enables validated learning.
- **Rapid prototyping:** paper → lo-fi storyboard → clickable wireframe → think-aloud test → SME review.
- **AI iteration loop:** Generate → Critic → Revise → Human Review → Approve.
- **Foundational AI iteration papers:** Self-Refine (Madaan et al., 2023); Reflexion (Shinn et al., 2023); Constitutional AI (Anthropic, 2022).
- **Stop-iterate-regenerate rule:** three unproductive iterations = regenerate with a better system prompt.
- **Quality gates:** Alpha, Beta, Gold with accessibility and Bloom-alignment audits at every gate; learner validation at Beta minimum.
- **Definition of done:** specific, testable criteria per artifact type, agreed before the sprint starts.
