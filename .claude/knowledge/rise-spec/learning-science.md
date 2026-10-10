# Learning science foundations

This file is the reasoning library that justifies every design choice in `design-principles.md`. Load this when:
- The spec needs evidence-based justification
- Designing for novice or expert tiers (expertise-reversal effect matters)
- The user asks "why" about a design choice
- Designing for a specific B2B software audience (for example specialist, end user, or partner)
- Choosing between interaction patterns where the right answer depends on cognitive science

For the operational checklist, see `design-principles.md`. This file is the reasoning that backs that checklist.

## Table of contents

1. Cognitive Load Theory and working memory
2. Mayer's CTML and the 12 multimedia principles
3. Dual Coding Theory
4. Retrieval practice (the testing effect)
5. Spaced repetition and interleaving
6. Microlearning duration evidence
7. Hook strategy and curiosity gap
8. Interactive content types ranked by evidence
9. Gamification: what works and what backfires
10. Motivation theory: SDT, ARCS, expectancy-value
11. Audience differentiation: Consultant / Customer / Partner
12. Friction taxonomies in self-paced learning
13. Completion data and ROI evidence
14. Skeptical flags: myths to never enforce

---

## 1. Cognitive Load Theory and working memory

**Sweller's CLT** (1988; Sweller, Ayres & Kalyuga 2011; Sweller 2022 evolutionary update) is the load-bearing framework for all microlearning design.

Three load types:
- **Intrinsic** — inherent content difficulty (multi-echelon inventory optimization is intrinsically hard); manage by sequencing and segmenting
- **Extraneous** — load from how material is presented; the only load to attack directly
- **Germane** — resources devoted to schema construction. Sweller (2010) reframed germane as part of intrinsic, not a separate bucket

**Sweller's evolutionary perspective** (2016, 2022) distinguishes:
- **Biologically primary** knowledge (spoken language, social inference) — acquired effortlessly
- **Biologically secondary** knowledge (software workflows, planning logic) — requires explicit instruction and imposes load

**All enterprise software training is secondary knowledge.** This justifies explicit worked-example instruction over discovery learning.

**Working memory capacity:** Cowan (2010) puts the effective chunk limit at roughly 3 to 5 items, not the older 7 plus or minus 2 (Miller 1956). Design for 3 to 5 chunks per screen on novel content.

**Practical mandates for B2B SaaS training:**
- Intrinsic load is high by definition — strip extraneous load aggressively, segment intrinsic load
- Chunk complex workflows into discrete decision points (one micro-module per planning heuristic, not the whole supply-planning chapter)
- Pre-train domain vocabulary before integrating concepts
- Present worked examples first for novices, then fade to problem solving (worked-example effect — Sweller & Cooper 1985)
- Place callouts on screenshots rather than in legends below them (spatial contiguity)
- Never duplicate narration with on-screen text (redundancy)

**Expertise-reversal effect** (Kalyuga, Ayres, Chandler & Sweller 2003): instructional methods that help novices can hurt experts. Worked examples help novices but can be redundant and load-inducing for experts. Design for the actual learner tier; do not assume one design fits all.

---

## 2. Mayer's CTML and the 12 multimedia principles

**Mayer's Cognitive Theory of Multimedia Learning** (2009/2020; *Cambridge Handbook of Multimedia Learning*, 3rd ed., 2021) translates CLT into media design. Three assumptions: dual channels, limited capacity, active processing.

**The 12 principles, grouped by load type:**

*Reduce extraneous load:*
- **Coherence** — exclude extraneous material
- **Signaling** — highlight essential information
- **Redundancy** — don't add on-screen text duplicating narration
- **Spatial Contiguity** — words and pictures together
- **Temporal Contiguity** — words and pictures simultaneous

*Manage essential load:*
- **Segmenting** — break into learner-paced chunks
- **Pre-training** — teach component names and characteristics first
- **Modality** — narration plus graphics outperforms on-screen text plus graphics

*Foster generative processing:*
- **Multimedia** — words plus pictures > words alone
- **Personalization** — conversational style
- **Voice** — human voice over machine
- **Image** — speaker's image not necessarily helpful

**Effect sizes:**
- 2025 meta-analysis of 591 effects from Mayer's research corpus: overall effect Hedges g = 0.37
- Ginns (2005) modality-effect meta-analysis: d = 0.72 (later reduced to roughly 0.20 to 0.38 after publication-bias correction)
- Noetel et al. systematic review of 1,189 studies (78,177 participants): largest currently-significant effects are removing seductive details, modality, personalization, sentence-level coherence, and self-explanation

**For software product training:**
- Narrate over a clean screen recording rather than narration plus on-screen bullets
- Use conversational voice ("Let's open your dashboard")
- Pre-train product terminology (for example "workspace," "alert workflow," "approval set") in 60-second flip-card primers
- Strip every stock-photo person and decorative animation that does not encode meaning

**Seductive Details Effect** (Harp & Mayer 1998; Rey 2012 meta-analysis; Bender et al. 2021/2023): interesting-but-irrelevant images, stories, sounds reduce recall and transfer. Effect is worst when seductive details appear early.

---

## 3. Dual Coding Theory

**Paivio's Dual Coding Theory** (1971, 1986, 1991): verbal (logogens) and visual (imagens) memory channels are functionally independent but interconnected. Dual-coded content has two retrieval pathways.

**Picture superiority effect:** Images recalled at roughly 2× the rate of equivalent words alone (Standing 1973: roughly 65% vs. roughly 10% after 3 days).

**Design implications:**
- Flip cards: pair term plus icon on the front with definition plus diagram on the back
- Process diagrams: label arrows verbally while structuring spatial flow visually
- Drag-and-drop adds motor encoding on top of verbal-visual dual coding
- Recurring metaphors (for example "supply-chain control tower") function as visual anchors to which subsequent verbal information attaches

**Concreteness fading** (Fyfe et al. 2014): start concrete (real product UI screenshot, real supply-chain example) and progressively abstract (generic schema, transferable principle). Concrete-first transfers better for novices; abstract transfers more once mastered.

---

## 4. Retrieval practice (the testing effect)

Of the 10 learning techniques reviewed by Dunlosky et al. (2013, *Psychological Science in the Public Interest*), only **practice testing and distributed practice received "high utility" ratings.** This is the single most actionable finding in the literature for microlearning design.

**Roediger & Karpicke (2006)** is the foundational study: a single test produced roughly 50% better retention at one week vs. re-reading or even concept mapping. Effect sizes typically d = 0.5 to 0.8 at delayed retention.

**Karpicke & Blunt (2011, *Science*):** retrieval practice beats elaborative concept-mapping on delayed transfer questions — not just recall. Critical for software training where learners must apply concepts to novel customer situations.

**Forward effect of testing** (Pastötter & Bäuml 2014): taking a test on Topic A enhances learning of subsequently studied Topic B.

**Recall vs. recognition:** Production tests (short answer, free recall) outperform recognition tests for transfer. Recognition is easier during practice but transfers less. Well-constructed multiple-choice with plausible distractors remains effective.

**Microlearning translation:**
- Embed 2 to 3 retrieval-practice events per module — not one quiz at the end
- Use scenario-based MCQs ("A customer says X. Which screen do you open first?")
- Drag-and-drop sequencing for procedural knowledge
- Branching scenario decisions for judgment
- Free-response prompts where possible

Karpicke's research shows learners systematically **underestimate** the value of testing relative to re-reading. Build retrieval into the flow rather than labeling it "quiz."

**Feedback design:**
- **Immediate corrective feedback** for novices on misconceptions
- **Delayed feedback** can improve long-term retention for experienced learners (Kulik & Kulik 1988 meta-analysis)
- Always explain the **job consequence** of a wrong choice, not just correctness

---

## 5. Spaced repetition and interleaving

**Cepeda et al. (2006) meta-analysis** of 187 studies (839 assessments, 317 experiments, *Psychological Bulletin*) establishes the spacing effect as one of the most replicated findings in learning science.

**Cepeda et al. (2008) "ridgeline" study** (*Psychological Science*): the optimum inter-study gap is roughly 10 to 20% of the desired retention interval.

| Need to remember for | Optimal gap |
|---|---|
| 1 week | 1 to 2 days (~20-40%) |
| 1 month | 1 week (~10-20%) |
| 6 months | 3 weeks (~10%) |
| 1 year | 3 to 4 weeks (~5-10%) |

**Rule of thumb: gap is roughly 10 to 20% of target retention interval.**

**Rohrer & Taylor (2006):** spaced practice doubled test scores at four-week delay vs. massed practice.
**Bahrick & Hall (2005):** spacing halves required practice.

**Forgetting curve:** The Ebbinghaus canon is real but often overstated. Will Thalheimer's review documents that meaningful, contextualized content decays much more slowly than the classic nonsense-syllable curve suggests.

**Design implication:** After an initial micro-module, schedule reinforcement at roughly 24 hours, 1 week, 1 month — Thalheimer's "subscription learning" model. Use spaced flashcard tools (Anki, Quizlet, EdApp, Axonify, Arist) for vocabulary and feature recognition. Distribute knowledge checks across days, not at end-of-module.

**Default schedule for typical workplace training (3 to 6 month retention):** days 1, 7, 21, 60.

**Interleaving vs. blocking:** Rohrer & Taylor (2007); Taylor & Rohrer (2010); Rohrer, Dedrick & Stershic (2015) — interleaved practice impairs in-session performance but doubles delayed test scores. Largest advantage when problems require discriminating which procedure to apply. Blocked practice can precede interleaving when learners are still acquiring procedures.

**How a single artifact participates in spaced practice:**
- Reference earlier modules ("Recall from Module 2…")
- Surface 2 to 3 retrieval cues for prior content before introducing new content
- End with "next checkpoint" promise scheduling retrieval
- Tag artifact with concepts so an LMS or spacing engine can re-surface them

---

## 6. Microlearning duration evidence

The duration evidence converges with surprising consistency:

- **Guo, Kim & Rubin (2014)** analysis of 6.9 million MOOC video sessions (ACM L@S '14): engagement peaks at videos under 6 minutes; drops sharply past 9 minutes; plateaus at roughly 50% of length once videos exceed 12 to 14 minutes
- **ATD Research** (n=228 organizations): 59% cite 2 to 5 minutes as most effective; roughly 10 minutes ideal; roughly 13 minutes maximum
- **2024 systematic review** (*IJEP*): corroborates
- **2024 healthcare-faculty survey:** 95.9% endorsing 3 to 5 minutes
- **2024-25 PRISMA meta-analysis** (Mathema Journal): microlearning effects of OR = 1.87 for retention and SMD = 0.74 for learning outcomes versus traditional formats

**TalentLMS practitioner completion data:**
- 3 to 5 minutes: roughly 90%
- 6 to 10 minutes: roughly 75%
- 11 to 15 minutes: roughly 60%
- Past 15 minutes: roughly 40%

**Differences by content type:**
- Conceptual or awareness content: 2 to 4 minutes
- Procedural content: 5 to 8 minutes
- Skill-building or decision-making: 8 to 12 minutes with scenario-driven structure
- Complex problem-solving with transfer: microlearning underperforms — needs 20+ min or a series

**CLT corollary:** Higher intrinsic load (complex B2B workflows) means more segmenting, not longer modules. Chain three eight-minute modules over three days rather than one twenty-four-minute marathon.

**When microlearning fails:** complex integrated tasks (breaking them prevents schema integration); no spacing follow-up; used as content-dump shortcut.

---

## 7. Hook strategy and curiosity gap

**Loewenstein's (1994) information-gap theory:** curiosity arises from a perceived gap between what one knows and what one wants to know. Peaks when learners have moderate prior knowledge — exactly the state of partial-product-knowledge B2B learners.

**Gruber, Gelman & Ranganath (2014, *Neuron*):** curiosity activates dopaminergic VTA/nucleus accumbens circuitry, enhancing hippocampal encoding even of incidentally presented information. **A strong hook improves retention of subsequent content, not just attention.**

**Wistia analytics** (over 100 million videos):
- Below 50% retention in the first 10 to 15 seconds: broken hook
- Above 70% past 30 seconds: solid

**Skeptical caveat:** "30 seconds" is designer convention. The mechanism is the curiosity gap, not the timer. 1 to 3 sentences at 10 to 30 seconds works.

**Hook patterns supported by evidence:**
1. Provocative question that exposes a gap (only if learner has enough prior knowledge)
2. Scenario or mini-case
3. Surprising statistic or counterintuitive finding
4. Relatable problem

**Distinction from clickbait:** Learning hooks open a gap that the learning content directly closes. The gap must align with the objective. Avoid seductive details (Mayer 2009): emotionally engaging but objective-irrelevant openings hurt learning.

**Avoid:** logo animations, table-of-contents intros, learning-objective bullets — all predict immediate drop-off.

**Practical pattern for B2B product training:** "Your biggest customer just doubled their order. Can your team absorb it?" within 15 to 20 seconds, promise the resolution, then deliver.

---

## 8. Interactive content types ranked by evidence

Five content types form a defensible evidence-based hierarchy for retention, engagement, and transfer in enterprise software training:

1. **Software simulations (sandboxed try-it)** lead on transfer
   - PwC VR studies: learners 4× faster than classroom
   - University of Central Florida: roughly 20% performance lifts
   - Whatfix-cited research: up to 75% retention lift versus passive video
   - Highest cost; decisive transfer-to-job advantage for procedural skills

2. **Branching scenarios** are second
   - Optimal for judgment-heavy skills (sales conversations, escalation, configuration trade-offs)
   - Meta-analytic transfer effects around d = 0.40 (Pan & Rickard)
   - Authoring time grows roughly exponentially with depth
   - Cathy Moore's recommendation: **mini-scenarios** (single decision, three plausible options) deliver roughly 80% of the benefit at 20% of the cost

3. **Knowledge checks with retrieval practice** (testing-effect literature, see Section 4 above)

4. **Video with embedded interactions** (hotspots, in-line questions)
   - Reduces mind-wandering
   - Outperforms passive video
   - Underperforms simulation

5. **Drag-and-drop, hotspots, flip cards, mini-games** form a long tail
   - Useful when tied tightly to a job task
   - Easily reduced to "interaction theater" otherwise
   - Mini-games show novelty-effect engagement spike that fades with repeated exposure (Mula-Falcón et al. 2022)

**Show-Try-Do for procedural enterprise software** (Salesforce Trailhead Hands-On Challenges, AWS Skill Builder Labs):
1. Narrated demo
2. Guided simulation with hints
3. Unhinted assessment simulation

For enterprise software products, full-tenant sandboxes are expensive. Software simulations via Articulate Storyline, Whatfix Mirror, or Assima can clone the UI for click-through practice without a real backend. Reserve real-tenant time for capstone scenarios.

**Cathy Moore's Action Mapping** is the dominant framework for scenario-led design:
1. Identify a measurable business goal (not "everyone completes training")
2. Identify what people need to do on the job (observable behaviors)
3. Design realistic practice activities for those behaviors
4. Embed information *inside* the activity, not before

Moore's "throw them in the deep end" stance — activity before content — aligns with problem-based learning research showing higher transfer.

**Ruth Clark (Clark & Mayer 2013) on scenario-based eLearning:**
- Scenarios work best when learners have some prior knowledge ("productive failure")
- Branching is worth its cost only for judgment-heavy decisions with cascading consequences
- For pure procedure: software simulation wins
- For factual recall: retrieval practice wins
- For single-right-answer content: standard knowledge check wins

---

## 9. Gamification: what works and what backfires

**Karl Kapp (2012, 2017)** distinguishes:
- **Structural gamification** (PBL — points, badges, leaderboards)
- **Content gamification** (story, challenge, characters, choice, consequences)

Content gamification is more powerful for learning. Structural gamification works as a behavioral nudge primarily when extrinsic rewards align with intrinsic motivation.

**Meta-analytic effect sizes:**
- Sailer & Homner (2020): cognitive g=.49, motivational g=.36, behavioral g=.25
- Li, Hew & Du (2024): improves intrinsic motivation, autonomy, relatedness perceptions; minimal impact on competency
- Deci, Koestner & Ryan (1999): tangible expected rewards undermined intrinsic motivation (engagement-contingent d=−0.40, completion-contingent d=−0.36, performance-contingent d=−0.28)

**What works for adult B2B learners:**
- **Progress bars** — most universally motivating element (Salesforce Trailhead's "X badges to go")
- **Badges as micro-credentials with external currency** — Trailhead badges have become resume currency; Wanted Analytics found a $20K salary premium for Salesforce skills
- **Tiered ranks** — Trailblazer Scout → Mountaineer → Ranger; AWS Cloud Practitioner → Solutions Architect → Specialty
- **Streaks and quests** that encourage spaced practice naturally

**What backfires:**
- Hanus & Fox (2015) longitudinal study: motivation, satisfaction, and grades **decreased** over a semester in gamified condition vs. control
- Mekler et al. (2017), Mula-Falcón et al. (2022): stacked game elements can reduce motivation
- Heavy extrinsic rewards (points, coins) shift focus from learning to score-collecting (Almeida et al. 2023: "superficial engagement")
- Public leaderboards humiliate low performers, particularly damaging in compliance and sales-enablement contexts
- Self-Determination Theory (Deci 1971 undermining effect): extrinsic rewards crowd out intrinsic motivation when learners already find a task meaningful

**Yu-kai Chou's Octalysis:**
- **White Hat** (Epic Meaning, Development, Empowerment, Ownership) = sustainable engagement
- **Black Hat** (Scarcity, Unpredictability, Loss/Avoidance) = short-term but creates anxiety/burnout

**Recommendation: "stealth gamification"** — subtle progress markers, narrative challenge, optional badging tied to real skill, recertification ladders. Avoid point economies and public leaderboards for adult professionals. Tie any extrinsic reward to competence (skill demonstrated) and autonomy (self-paced choice).

---

## 10. Motivation theory: SDT, ARCS, expectancy-value

**Self-Determination Theory** (Deci & Ryan 2000, 2017; Gagné & Deci 2005) identifies three universal psychological needs:
- **Autonomy** — volition, perceived choice
- **Competence** — mastery, growing capability
- **Relatedness** — peer or mentor connection

A 2024 workplace SDT meta-analysis confirms autonomous motivation predicts engagement, lower burnout, learning persistence. **SDT is the strongest predictor of self-paced completion.**

**In enterprise software contexts, autonomy is often the constrained need:**
- Customers face mandatory training
- Consultants face billable-hours pressure
- Partners face certification deadlines

Design must restore choice (paths, pacing, sequence) to prevent reactance.

**Keller's ARCS model** (1987) operationalizes SDT into design:
- **Attention** — perceptual and inquiry arousal (hooks, problem-first openings)
- **Relevance** — WIIFM, role-tied examples
- **Confidence** — clear objectives, scaffolded difficulty, early small wins
- **Satisfaction** — intrinsic mastery plus extrinsic credentials, immediate-application opportunities

ARCS is the most directly actionable instructional-design framework for microlearning module-level design.

**Expectancy-value theory** (Eccles & Wigfield): four value components determining task engagement:
- Utility value (will this help me?)
- Attainment value (does this matter to my identity?)
- Intrinsic value (do I enjoy this?)
- Cost (what does it take from me?)

Self-paced microlearning typically optimizes utility and minimizes cost. Personas should capture all four.

---

## 11. Audience differentiation: Consultant / Customer / Partner

The same content cannot serve all three audiences. Deliberate segmentation by role, expertise tier, and motivation type is the single highest-leverage design decision for B2B SaaS training.

**Consultant default profile:**
- Expert or intermediate tier
- Low scaffolding
- High edge-case appetite
- Time-pressed
- Certification-anchored success criteria
- Problem-solving practice over worked examples
- Sandbox-heavy
- Anti-pattern: certification-irrelevant theory; "intro to" content

**Customer default profile:**
- Variable tier (sub-segment by role: planner / admin / executive)
- High relevance demand
- Low friction tolerance
- Immediate-task success criteria
- Role-specific scenarios
- Strong WIIFM up front
- DAP integration (Whatfix, Pendo, WalkMe)
- Anti-pattern: vendor jargon; long onboarding before value

**Partner default profile:**
- Certification-driven
- Dual-track (sales positioning vs. technical delivery)
- Peer-learning oriented
- Revenue-linked success criteria
- Rigorous validation
- Release-ahead access
- Anti-pattern: customer-flavored content; hidden roadmap

**Persona attribute schema** (Malamed, Dirksen, Moore, Shank synthesis) — twelve clusters that demonstrably predict friction, motivation, prior-knowledge gaps, and success in self-paced microlearning. Each must tie to a design decision; "loves coffee" filler is forbidden:

1. Identity and role context (name, role, audience type, sub-segment, role context)
2. Three-layered goals (immediate task, project, career)
3. Prior knowledge tier (domain, tool, adjacent-tool transfer, declarative vs. procedural depth)
4. Motivation profile (voluntariness, primary driver, expectancy-value snapshot)
5. SDT need state (which need is most constrained)
6. Context and constraints (time, learning context, device, deadline)
7. Friction profile (technical, cognitive, motivational, contextual)
8. Self-regulation and mindset (Zimmerman SRL, growth/fixed mindset)
9. Social learning preference (solo / community / mentor / peer cohort)
10. Success criteria (Cathy Moore action-mapping style: observable, behavioral)
11. Design recommendations (output not input — module length, scaffolding, scenario type)
12. Anti-patterns to flag

---

## 12. Friction taxonomies in self-paced learning

Five categories of friction (eFront, Shift, NIDO, Willging & Johnson 2009, Upside Learning):

1. **Technical** — SSO failures, sandbox provisioning delays, broken video, mobile rendering. Highest abandonment trigger after time conflict.
2. **Cognitive** — jargon, missing prerequisites, dense screenshots without orientation, expert-level assumptions on novice content
3. **Motivational** — unclear value, no time, "this doesn't apply to my role," vague objectives, content that feels like marketing
4. **Design** — outdated visuals, poor navigation, monotony, unclear progress
5. **Contextual** — interruptions, lack of psychological safety to "look stupid," especially for senior learners

**Top friction points in enterprise software learning (vendor research):**

1. Sandbox / environment access — single biggest friction point. Costs are real, provisioning is slow, license seats limited, trial accounts expire.
2. Time-to-relevance — courses that front-load architecture before the actual task lose consultants and business users immediately
3. Mismatched depth — too deep for end-users (data-model details a planner doesn't need) or too shallow for implementers (no edge cases)
4. Content drift — recorded courses age in months in fast-evolving SaaS; addressed by Delta Exams (ServiceNow), "Stay Certified" assessments (SAP)
5. Discoverability — learners cannot find the right content among hundreds of modules; addressed by Trailmix curation (Salesforce), role-pathway curation (Microsoft)

---

## 13. Completion data and ROI evidence

Self-paced eLearning completion rates are highly population-dependent. The 20 to 30% industry average masks a wide distribution:

- Jordan (2014) MOOCs meta-analysis: **median 12.6%** (range 0.7 to 52.1%)
- Reich & Ruipérez-Valiente (*Science*, 2019) MIT/Harvard edX: **3.13% completion in 2017-18**, but **46% among verified (paid) students**
- Cohort-based courses: **85 to 90%** completion
- ATD overall employee training: roughly 72%
- Mandatory training in mature organizations: 95 to 100% target
- Vendor figures (Vouch, Continu, 360Learning) of 80 to 91% sit near top of range — treat as directional

**Drop-off curves:** Heavy attrition in first 5 minutes, particularly first 30 to 60 seconds. In MOOCs, roughly 50% of registrants never start; of those who start, another roughly 50% drop in module 1.

**Completion-improving factors:**
- Price / skin-in-the-game: Teachable found 61% higher completion above $200 vs. below $50
- Manager support: Gartner +37% completion when managers actively discuss progress
- Cohort plus community plus coaching: 70%+ vs. 10 to 15% self-paced alone
- Short modules (under 10 min)
- Knowledge checks
- Deadlines
- Social features

**Customer education ROI** (most rigorous quantitative finding for enterprise contexts):
- 2024 Forrester TEI study commissioned by Intellum (n=300 director-level decision-makers):
  - **372% three-year ROI**
  - 96% reporting positive ROI
  - +38.3% product adoption
  - +35% customer LTV per trainee
  - +28.9% new-customer win rate
  - +26.2% CSAT
  - −15.5% support costs
- TSIA: 68% of trained customers use the product more, 56% use more features, 87% work more independently
- Customer education spending projected to more than double by 2026

**Will Thalheimer's LTEM (Learning-Transfer Evaluation Model, v13, 2024)** argues correctly that completion is a vanity metric. Higher tiers (decision-making, task competence, transfer, business effects) are what matter.

**LinkedIn 2025 Workplace Learning Report:** career progression is the #1 motivator for employees to learn, but only 36% of organizations qualify as "career development champions." 91% of L&D pros agree continuous learning is more important than ever; 71% are integrating AI; only 15% of employees say their manager helped build a development plan in the past six months.

**Bersin:** 84% of organizations fail to align learning content with required business capabilities — the gap that capability-academy and persona-driven microlearning models attempt to close.

---

## 14. Skeptical flags: myths to never enforce

The skill must NEVER bake in:

1. **"Learning styles" (visual/auditory/kinesthetic)** — Pashler et al. (2008) found no evidence. Coffield et al. (2004) reviewed 71 learning-style models and found none predicted learning outcomes.

2. **"8-second goldfish attention span"** — Microsoft 2015 stat misread web-dwell time. Bradbury (2016): not supported.

3. **"10-minute attention span" for lectures** — Bradbury (2016) traced the claim to a single 1978 article about note-taking, not lecture attention.

4. **"People remember 10% of what they read, 90% of what they do" (Dale's Cone)** — fabricated percentages. Edgar Dale's original cone of experience never had numbers.

5. **"70% forgotten in 24 hours"** — distortion of Ebbinghaus's nonsense-syllable forgetting curve. Meaningful contextualized content decays much more slowly.

6. **"Brain-based learning" / left-brain/right-brain** — neuromyths.

7. **Generational differences in learning** — Kirschner & De Bruyckere (2017) refute. There is no "digital native" learning advantage.

8. **Microsoft 8-second statistic for attention** — misuse of telemetry data; not a learning-science finding.

When any of these appear in user input, source content, or stakeholder feedback, the skill should gently correct using the cognitive science alternative — without lecturing.
