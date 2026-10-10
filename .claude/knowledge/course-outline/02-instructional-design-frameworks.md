# Instructional design frameworks for AI-generated microlearning

Eight frameworks anchor modern instructional design. Most predate AI-generated content by decades, but they still tell us what good learning looks like. This module covers each one, with an explicit map to how it applies — or must be adapted — for tapas-style AI pipelines.

## ADDIE

Developed in 1975 by Florida State University's Center for Educational Technology for the U.S. Army (Branson et al., 1975, IPISD / TRADOC Pam 350-30). The acronym itself didn't appear in writing until Schlegel (1995) (Molenda, 2015). The five phases:

1. **Analysis** — audience, gap, constraints, objectives.
2. **Design** — strategy, sequencing, assessment blueprint.
3. **Development** — build content and media.
4. **Implementation** — deliver; train facilitators.
5. **Evaluation** — formative throughout; summative at end (commonly via Kirkpatrick).

ADDIE's waterfall structure is a poor fit for rapid iteration. Training Industry notes it is "costly and time-consuming [compared to] the newer approaches referred to as agile development." Keep ADDIE's Analysis and Design phases as upstream spec for the AI tool; collapse Development/Implementation/Evaluation into a SAM-style loop.

## SAM (Successive Approximation Model)

Michael Allen's agile alternative (Allen & Sites, 2012, *Leaving ADDIE for SAM*, ATD Press). Three phases: **Preparation** (culminating in a collaborative "Savvy Start"), **Iterative Design**, **Iterative Development** (three releases: Alpha, Beta, Gold). SAM1 is the lightweight variant; SAM2 is the full three-phase form.

SAM is the **highest-compatibility framework for AI-generated microlearning**. Alpha/Beta/Gold mirrors "rough draft → refined → shipped." Ali et al. (2021, ERIC EJ1324100) found SAM outperformed ADDIE on STEM post-test gains. Use SAM as the default production rhythm.

## Bloom's taxonomy (revised)

Original taxonomy: Bloom et al. (1956). Revised by Anderson & Krathwohl (2001), published in *A Taxonomy for Learning, Teaching, and Assessing*. Key changes (Krathwohl, 2002, *Theory Into Practice*, 41(4)): noun levels became verbs; top two levels swapped so **Create** sits above **Evaluate**; a new Knowledge Dimension (Factual, Conceptual, Procedural, Metacognitive) runs orthogonal.

### Action-verb banks

- **Remember** — define, identify, list, name, recall, recognise, state, label, match, memorise, cite, quote, reproduce, locate.
- **Understand** — describe, explain, paraphrase, summarise, classify, compare, contrast, illustrate, infer, interpret, restate, translate, discuss.
- **Apply** — apply, demonstrate, employ, execute, implement, operate, solve, use, practise, compute, modify, construct, simulate.
- **Analyse** — analyse, categorise, compare, contrast, deconstruct, differentiate, distinguish, examine, organise, outline, diagram, attribute.
- **Evaluate** — appraise, assess, critique, defend, judge, justify, prioritise, recommend, validate, argue, check, monitor.
- **Create** — compose, construct, design, develop, devise, formulate, generate, hypothesise, invent, plan, produce, synthesise.

> **Design Tip:** Tag every tapa with a target Bloom level and confirm the activity's verbs match the objective's verb. Verb drift (objective says "Apply," item tests "Remember") is the single most common AI content defect.

## Kirkpatrick model (and Phillips L5)

Donald Kirkpatrick's 1954 dissertation, published as articles in 1959. Four levels:

1. **Reaction** — engagement, relevance, favorability.
2. **Learning** — knowledge, skill, confidence acquired.
3. **Behaviour** — on-the-job application, typically measured at 3–6 months.
4. **Results** — productivity, quality, retention, revenue.

Jim and Wendy Kirkpatrick's **New World Kirkpatrick Model** (2016, ATD Press) emphasises **required drivers** (reinforcement, accountability) and **reverse design** — start by defining Level 4 results, work backward to Level 1. Jack Phillips (1996) added **Level 5 ROI**: `(Net Benefits ÷ Costs) × 100`; Patti Phillips recommends applying L5 only to 5–10% of programs.

For AI-generated tapas: embed L1 reactions (thumbs) and L2 checks directly in the artifact; connect to external LMS/CRM data for L3/L4.

## Merrill's First Principles of Instruction

David Merrill (2002, *Educational Technology Research & Development*, 50(3)) derived five prescriptive principles across dozens of ID models:

1. **Problem-centered** — learning is promoted when learners solve real-world problems.
2. **Activation** — prior knowledge is surfaced as a foundation.
3. **Demonstration** — new knowledge is shown to the learner.
4. **Application** — the learner uses the new knowledge with coaching that fades.
5. **Integration** — the learner reflects on transfer to their own world.

Merrill's Pebble-in-the-Pond model operationalises these: start with a concrete problem and ripple outward. This is arguably the **single best structural template for a tapa**. Every generated unit should include all five moments.

## Gagné's nine events of instruction

Robert Gagné (1985, *The Conditions of Learning*, 4th ed.): gain attention → inform objectives → stimulate recall → present content → provide guidance → elicit performance → provide feedback → assess → enhance retention/transfer.

For tapas compression, fold the nine events into four beats:

- **Opener (≤20 sec):** events 1–3 combined (hook + objective + recall prompt).
- **Core (30–90 sec):** events 4–5 (content + guided example).
- **Practice (1 item + feedback):** events 6–7.
- **Close:** event 8 optional; event 9 handled by spaced review + job aid.

McNeill & Fitch (2023, *TechTrends* 67) detected eight of the nine events across a sample of microlearning — the compression works.

## Understanding by Design (backward design)

Wiggins & McTighe (1998, 2005, *Understanding by Design*, ASCD). Three stages:

1. **Identify desired results** — goals, **enduring understandings**, **essential questions**, knowledge/skills.
2. **Determine acceptable evidence** — think like an assessor before an activity designer; GRASPS performance tasks.
3. **Plan learning experiences** — WHERETO heuristic.

The **six facets of understanding** — Explain, Interpret, Apply, Perspective, Empathy, Self-knowledge — give a richer assessment palette than Bloom alone. UbD works best at *series* level: essential questions span multiple tapas; a single tapa typically hits one or two facets.

## Constructivism and social learning

- **Piaget** — schemas, assimilation, accommodation, equilibration; learners as "little scientists."
- **Vygotsky** (1978, *Mind in Society*) — **Zone of Proximal Development**: the distance between what a learner can do alone and what they can do with a more knowledgeable other. The term "scaffolding" was coined later by Wood, Bruner & Ross (1976).
- **Bandura** (1977, *Social Learning Theory*) — observational learning via attention → retention → reproduction → motivation; **self-efficacy** as a central driver; the **Bobo doll studies** (1961, 1963) demonstrated learning without direct reinforcement.

AI-generated microlearning operationalises all three: adaptive difficulty places learners inside the ZPD; the AI itself acts as a 24/7 MKO providing scaffolding; video demonstrations and avatars supply observational models; small wins in tapa format build self-efficacy. The gap remaining is Vygotskian *social* interaction — address it with cohort or peer elements around the AI-generated spine.

## Mapping frameworks to tapas / AI pipelines

| Framework | Fit | Use it for |
|---|---|---|
| ADDIE | Medium | Upstream Analysis + Design only |
| **SAM** | **Very high** | Production rhythm; Alpha/Beta/Gold |
| **Bloom's (revised)** | **Very high** | Tag every artifact; drive verb-level QA |
| Kirkpatrick + Phillips | High (L1–L2), Medium (L3–L4) | Embed L1/L2 in-unit; pipe to external systems |
| **Merrill's First Principles** | **Very high** | Structural template for every tapa |
| Gagné's nine events | High (compressed) | Internal beat sheet for single-unit copy |
| Understanding by Design | Medium (single unit), High (series) | Program-level spec; essential questions as hooks |
| Constructivism / social | Medium-High | Adaptive difficulty + observational modeling |

## Quick reference

- **Spec** a program via UbD backward design and Kirkpatrick reverse flow.
- **Structure** each tapa on Merrill's five principles.
- **Write copy** against Gagné's compressed nine events.
- **Tag objectives** with Bloom's revised verbs; audit for verb-level drift.
- **Produce** in SAM mode: Alpha → Beta → Gold.
- **Measure** via Kirkpatrick L1/L2 in-unit; external systems for L3/L4.
- **Situate** content in the learner's ZPD with modeling and small wins.

---
