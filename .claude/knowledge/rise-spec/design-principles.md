# 2026 Modern Learning Design Principles (enforcement)

This file is the source of truth for the 2026 Modern Learning Design Principles. Every spec produced by this skill must enforce all nine principles, anchored to the foundational Golden Circle framework below. The skill performs a design principles audit (Step 5 of the workflow) before presenting a spec; failures are fixed before the spec is shown.

For the deeper cognitive science underpinning these principles (Sweller, Mayer, Roediger, Karpicke, Cepeda, Deci, Cathy Moore, etc.), see `learning-science.md`. This file is the operational checklist; that file is the reasoning library.

---

## Foundational framework: Start with WHY (the Golden Circle for eLearning Development)

> Start with purpose. Design for impact.

The nine principles below govern *execution*. The Golden Circle governs *whether the artifact should exist at all and what it is solving for*. Before any of the nine principles are applied, the spec must be anchored to a clear WHY. The audit checks this first. If a spec cannot answer WHY in a behavior or business outcome, it does not matter how clean the hook is or how disciplined the cognitive load is. The artifact is solving the wrong problem.

### Core principle

When we start with WHY, we design learning that matters. It is not about building more eLearning. It is about building the **right learning for the right impact.**

**The chain of change:** Changing mindsets → Changing behaviors → Improving results

### The three layers

**WHY: The Learning Purpose (innermost)**

- *Question to ask:* Why are we doing this? What change or impact are we trying to achieve?
- *Definition:* The real reason we are investing in learning. The problem we are solving and the impact we want to create.
- *Examples:* Improve a critical behavior. Reduce risk or errors. Increase confidence. Drive performance. Support a business goal.

**HOW: The Learning Approach (middle)**

- *Question to ask:* How will we make it happen?
- *Definition:* The strategy, methods, and experiences that will drive the desired change.
- *Examples:* 70:20:10 blend. Practice and application. Feedback and reinforcement. Social learning. Performance support.

**WHAT: The Learning Solution (outermost)**

- *Question to ask:* What are we creating?
- *Definition:* The actual eLearning or learning experience we build.
- *Examples:* eLearning module. Microlearning. Interactive scenario. Video or job aid.

### Design guidance

Always begin with **WHY** before defining **HOW** or **WHAT.** Working outward from purpose ensures every learning solution is:

- Tied to a real behavior or business outcome
- Delivered through a strategy that matches the change needed
- Built as the most appropriate artifact for the job

**Do not start with the format. Start with the problem.**

### How to enforce in the spec

- The spec's learner context (Section 3) and learning objective (Section 2) together must answer WHY: a real behavior change or business outcome, not a topic to cover.
- If the only stated reason for the artifact is "we need to teach X" or "the SME asked for a module on Y," that is a topic, not a WHY. Push back and surface the underlying behavior or outcome before drafting the spec.
- If the user has anchored the request in a format first (for example, "let's build a flip card deck for onboarding"), confirm the WHY before validating the WHAT. The interaction type is a HOW or WHAT decision and follows from the WHY.
- A useful test: complete the sentence "If this artifact works, learners will [observable behavior] and the business will see [outcome]." If you cannot complete it, the WHY is missing.

### Examples

✗ "We need a module on the new approval workflow."
✓ "Approvers are bottlenecking releases because they default to manual checks. We want approvers to confidently use the new workflow's automated checks so cycle time drops by 30%."

✗ "Build a flip card deck on KPI definitions."
✓ "New consultants misinterpret three KPIs in client conversations, eroding credibility in the first 90 days. We want them to apply the correct KPI definition in a client-facing scenario on first attempt."

---

## The nine principles

1. **One learning objective per artifact**
2. **Hook in the first 30 seconds**
3. **Cognitive load discipline**
4. **Immediate application at the end**
5. **Role-based learner context**
6. **Gamification where applicable (white hat only)**
7. **Mandatory visual anchor**
8. **Spaced repetition awareness**
9. **10-minute max completion time**

---

## 1. One learning objective per artifact

**The rule:** Each interactive component teaches one and only one observable, measurable behavior.

**Why it matters:** Multiple objectives splinter cognitive resources, weaken assessment validity, and dilute spaced-repetition tagging. Microlearning research (Guo et al. 2014; ATD; PRISMA 2024-25) consistently shows that single-objective modules outperform multi-objective ones on retention and transfer.

**How to enforce in the spec:**
- Section 2 must state exactly one objective using a Bloom's verb at Apply or higher (Apply, Analyze, Evaluate, Create).
- Reject "understand," "learn," "know," "appreciate," "be familiar with," "be aware of."
- Format: "By the end of this component, the learner will be able to [verb] [object] [condition]."
- If the user supplies multiple objectives, propose splitting into multiple components.

**Examples:**

✗ "Learners will understand refund approval rules and be able to configure them."
✓ "By the end of this component, the learner will be able to apply the four refund approval rule types to three customer-dispute scenarios with at least 80% first-attempt accuracy."

---

## 2. Hook in the first 30 seconds

**The rule:** Open with a curiosity-gap-opening, domain-credible problem in 1 to 3 sentences (10 to 30 seconds of read or listen time). No logo animations, no learning-objective bullets, no table of contents.

**Why it matters:** Loewenstein's (1994) information-gap theory and Gruber, Gelman & Ranganath (2014) demonstrate that curiosity activates dopaminergic encoding pathways, improving retention of subsequent content — not just attention. Wistia analytics across 100M+ videos show below-50% retention in the first 10 to 15 seconds indicates a broken hook. The opening hook is disproportionately consequential.

**Skeptical caveat:** "30 seconds" is a designer convention, not a research mandate. The mechanism is the curiosity gap, not the timer. Anywhere from 10 to 30 seconds works as long as the gap opens credibly.

**How to enforce in the spec:**
- Section 4 must contain verbatim hook copy.
- The hook must open an information gap the rest of the artifact will close.
- The hook must be aligned to the objective (no seductive details — Mayer 2009; Harp & Mayer 1998).
- Reject openings that lead with "Welcome to Module X" or "By the end of this module you will...".

**Hook patterns supported by evidence:**
1. Provocative question that exposes a gap (only if learner has enough prior knowledge)
2. Scenario or mini-case ("Your largest customer just doubled their order — can your plan absorb it?")
3. Surprising statistic or counterintuitive finding
4. Relatable problem

---

## 3. Cognitive load discipline

**The rule:** Every screen presents at most 3 to 5 chunks of new information. No decoration that does not encode meaning. No narration plus on-screen bullets duplication. Pre-train terminology before integrating concepts.

**Why it matters:** Sweller's Cognitive Load Theory (1988, 2011, 2022 evolutionary update) and Mayer's CTML (2009/2020/2021) are the load-bearing frameworks. Working memory holds roughly 3 to 5 chunks (Cowan 2010 — not the older 7 plus or minus 2). Enterprise software content has high intrinsic load by definition; the only load to attack directly is extraneous load.

**How to enforce in the spec:**
- Section 5 (component anatomy) lists every visible part. If any screen has more than 5 chunks, split or sequence.
- Section 9 (visual design) names the visual and rejects decorative stock photos, unrelated mood imagery, and decorative animation.
- Section 7 (content and copy) does not duplicate narration with on-screen text (Redundancy principle).
- Section 11 (accessibility) flags `prefers-reduced-motion` to disable non-essential animation.

**Practical rules:**
- 3 to 5 items per screen for novel content
- Each "screen" is one idea plus one decision or check
- Never duplicate narration with on-screen text
- Place labels within roughly 2cm of the visual they describe (spatial contiguity)
- Pre-training step if explaining a process with more than 3 components
- Use second-person voice ("You'll see…")
- Avoid background music, decorative animations, irrelevant photos (seductive details — most damaging when placed early)

---

## 4. Immediate application at the end

**The rule:** The artifact ends with a decision, scenario, or applied task — not a recall quiz. The learner does the thing, in context, before exiting.

**Why it matters:** Roediger & Karpicke (2006) and the testing-effect literature show retrieval practice produces roughly 50% better retention at one week than re-reading. Karpicke & Blunt (2011, *Science*) demonstrated retrieval practice beats elaborative concept-mapping on transfer questions. Cathy Moore: assessment is doing the action, not naming it.

**How to enforce in the spec:**
- Section 6 (interaction model) ends with a state where the learner produces an answer or makes a decision in context.
- Section 14 (acceptance criteria) includes a verifiable applied check (Given/When/Then preferred for branching).
- Reject end-state recall quizzes ("Which of the following is the definition of...?") unless the artifact is explicitly Remember/Understand level. Even then, prefer scenario-flavored framing.
- For procedural content, structure as Show-Try-Do (narrated demo, guided practice, unhinted assessment).

**Strong patterns:**
- "A customer says X. Which screen do you open first?"
- "Given this refund dispute, drag the rules into priority order."
- "Choose the next agent action and see the resulting outcome."

**Weak patterns (avoid):**
- "Match the term to the definition."
- "Which of these is true about refund approval rules?"
- Multiple-choice on factual recall as the only summative element.

---

## 5. Role-based learner context

**The rule:** The artifact opens with a specific role and concrete situation. Generic "the learner will..." framing is rejected.

**Why it matters:** Situated cognition (Brown, Collins & Duguid 1989; Lave & Wenger 1991) and scenario-based learning meta-analysis (Chernikova et al. 2020, g around 0.85) support role-anchored, contextualized learning over decontextualized exposition. Cathy Moore's action mapping leads with the on-the-job behavior. For example, an implementation specialist, an end user, and a partner solution architect have different success criteria for the same product — one component cannot serve all three.

**How to enforce in the spec:**
- Section 3 must use this format: "As a [role] who [context], I need to [behavior] so that [business outcome]."
- The role must be specific (support agent handling an escalated refund; regional sales manager reviewing a forecast; partner solution architect) — not "user" or "learner."
- The business outcome must be observable on the job, not "complete the training."
- For multi-audience needs, recommend separate artifacts per audience tier (for example specialist, end user, and partner) rather than one generic artifact.

**Audience defaults (use when the user is vague):**

- **Specialist or implementer:** expert/intermediate tier, low scaffolding, high edge-case appetite, time-pressed, certification-anchored success criteria, problem-solving practice over worked examples, sandbox-heavy.
- **End user or customer:** variable tier (sub-segment by role, for example practitioner, administrator, or executive), high relevance demand, low friction tolerance, immediate-task success criteria, role-specific scenarios, strong WIIFM up front.
- **Partner or reseller:** certification-driven, dual-track (sales positioning versus technical delivery), peer-learning oriented, revenue-linked success criteria, rigorous validation.

---

## 6. Gamification where applicable (white hat only)

**The rule:** Apply gamification only when it serves the learning objective. Use Yu-kai Chou's white-hat mechanics (Epic Meaning, Development, Empowerment, Ownership). Reject black-hat (Scarcity, Loss/Avoidance, public competition) for adult professional learners.

**Why it matters:** Sailer & Homner (2020) meta-analysis shows positive effects of gamification overall, but Hanus & Fox (2015), Mekler et al. (2017), and Mula-Falcón et al. (2022) document that stacked PBL (points/badges/leaderboards) reduces motivation over time and humiliates low performers. Deci, Koestner & Ryan (1999) on the undermining effect: tangible expected rewards reduce intrinsic motivation when learners already find a task meaningful.

**How to enforce in the spec:**
- Section 6 (interaction model) names gamification elements explicitly and ties each to a competence or autonomy mechanism.
- Reject points-only economies, public competitive leaderboards, and stacked PBL.
- Default to "stealth gamification": progress bars, mastery feedback with specific formative information, meaningful narrative, optional badges tied to real skill, tiered ranks (Trailblazer-style).

**White-hat patterns that work for adult B2B learners:**
- Progress bar tied to real competence (not just steps completed)
- Mastery feedback with specific formative information ("you sequenced 6 of 7 steps correctly; review step 4")
- Meaningful narrative wrapper
- Meaningful choice (path, pacing, optional challenge)
- Streaks and quests that encourage spaced practice

**Black-hat patterns to reject:**
- Points-only systems ("collect 100 supply chain coins")
- Public competitive leaderboards on compliance training
- Anxiety-inducing scarcity ("only 3 minutes left!")
- Stacked PBL with no skill connection (Karl Kapp's "Shell Gamification" critique)

---

## 7. Mandatory visual anchor

**The rule:** Every artifact specifies a primary visual that ties to the learning objective. No text-only specs.

**Why it matters:** Paivio's Dual Coding Theory and Mayer's Multimedia Principle (d around 1.39) show pictures plus words consistently beat words alone. Picture superiority effect: pictures recalled at roughly 65% vs. roughly 10% for words after 3 days (Standing 1973). Recurring metaphors function as visual anchors to which subsequent verbal information attaches.

**How to enforce in the spec:**
- Section 9 is never blank. It names the anchor visual, its purpose, and its placement.
- Reject decorative stock photos and unrelated mood imagery (Coherence principle).
- For abstract concepts, prefer concrete-then-abstract progression (concreteness fading — Fyfe et al. 2014).
- Caption each visual with a one-line "what this shows."

**Strong visual anchor patterns:**
- Schematic diagram for system architecture (preferred over realistic)
- Annotated screenshot of the actual product UI
- Process flowchart for procedural content
- Recurring metaphor visual (control tower, data pipeline, permissions-as-keys)

**Weak patterns to reject:**
- Stock photo of generic person at laptop
- Decorative geometric pattern with no information
- Photo unrelated to the content (seductive detail)

---

## 8. Spaced repetition awareness

**The rule:** Every artifact tags the concepts it teaches and references how it participates in a wider spacing schedule. Even single-shot artifacts must surface this.

**Why it matters:** Cepeda et al. (2006) meta-analysis of 187 studies: spacing effect is one of the most replicated findings in learning science. Optimum inter-study gap is roughly 10 to 20% of desired retention interval (one week of retention needs roughly one day of gap; six months of retention needs roughly three weeks of gap). Bahrick & Hall (2005): spacing halves required practice.

**How to enforce in the spec:**
- Section 8 (branching/flow) or Section 13 (tracking) references the artifact's place in a spaced schedule.
- The artifact tags the concepts taught (so an LMS or spacing engine can re-surface them).
- Reference earlier modules where appropriate ("Recall from Module 2 that refund approval rules...").
- End with a "next checkpoint" promise scheduling retrieval (for example "You'll apply these rules in Module 4's planning capstone").

**Default schedule for typical workplace training (3 to 6 month retention):** review at days 1, 7, 21, 60.

---

## 9. 10-minute max completion time

**The rule:** Every artifact completes in 10 minutes or less. If content exceeds 10 minutes, split into multiple artifacts.

**Why it matters:** Guo, Kim & Rubin's (2014) analysis of 6.9M MOOC video sessions shows engagement peaks at videos under 6 minutes and drops sharply past 9 minutes. ATD: 59% of practitioners cite 2 to 5 minutes as most effective microlearning length, with roughly 10 minutes ideal and roughly 13 minutes maximum. TalentLMS practitioner data: 3 to 5 minute modules hit roughly 90% completion, falling to roughly 60% at 11 to 15 minutes.

**Skeptical caveat:** This is not because adult attention spans are short (the 8-second goldfish stat is a misread Microsoft 2015 web-dwell statistic, not learning research). It is because shorter modules force enforced segmenting plus spacing across modules plus tighter coupling to one objective. The mechanism is good design, not attention-span limits.

**How to enforce in the spec:**
- Section 1 (summary) or Section 6 (interaction model) states expected duration.
- If estimated duration exceeds 10 minutes, propose splitting into a sequence (A, B, C) and confirm with user.
- For complex multi-decision scenarios, treat the playthrough as one unit but ensure replay is voluntary.

**Default durations by content type:**
- Factual recall or definition: 2 to 5 minutes
- Procedural how-to: 5 to 10 minutes
- Conceptual understanding with application: 8 to 15 minutes (split if over 10)
- Complex multi-decision scenario simulator: 8 to 20 minutes (split if over 10; replay encouraged)

---

## The audit (Step 5 of the workflow)

Before presenting a spec, run this checklist. Failures must be fixed.

| # | Check | Pass criterion |
|---|---|---|
| 1 | One learning objective | Section 2 has exactly one Bloom-verb objective at Apply+ |
| 2 | Hook in first 30 seconds | Section 4 has 1 to 3 sentences of curiosity-gap copy, no logo or bullet objectives |
| 3 | Cognitive load discipline | No screen has more than 5 chunks; no decorative imagery; no narration-plus-bullet duplication |
| 4 | Immediate application | Section 6 ends with decision or applied task; Section 14 has Given/When/Then or applied criteria |
| 5 | Role-based learner context | Section 3 names role, situation, business outcome (As-a-Who-needs-So-that format) |
| 6 | Gamification white-hat | No PBL stacking; no public leaderboards; any gamification ties to competence or autonomy |
| 7 | Mandatory visual anchor | Section 9 names the anchor visual and its purpose |
| 8 | Spaced repetition awareness | Section 8 or 13 references concept tagging and place in spacing schedule |
| 9 | 10-minute max | Section 1 or 6 states duration estimate; if over 10 minutes, content is split |

If any row fails, fix the spec before showing the user.
