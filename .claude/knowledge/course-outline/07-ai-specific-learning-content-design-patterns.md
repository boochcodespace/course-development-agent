# AI-specific learning content design patterns

AI-generated learning content fails in predictable ways: generic scenarios, passive voice, missing hooks, Bloom-level drift, hallucinated citations, mode collapse into "AI voice." The patterns in this module are the counter-moves. Together they define how our AI tool should be prompted, what it should output, and what it should check before returning.

## Writing system prompts that enforce learning design

Anthropic's and OpenAI's best-practice docs converge on a layered, tagged structure. For learning content specifically, a system prompt should set seven things in this order: role, task, inputs, design principles, style constraints, output format, self-check.

```xml
<role>
You are a senior instructional designer (15 years, corporate L&D)
fluent in Bloom's revised taxonomy, Mayer's multimedia principles,
Cathy Moore's action mapping, and Haladyna's 31 MCQ guidelines.
You write content learners actually finish.
</role>

<task>Produce {artifact_type} for a single learning objective.</task>

<inputs>
- Learning objective: {observable behaviour + conditions + criterion}
- Learner profile: {role, seniority, daily tools, success metric}
- Bloom level: {remember|understand|apply|analyze|evaluate|create}
- Time budget: {minutes}
</inputs>

<design_principles>
1. Start from the moment of need, not the body of knowledge.
2. First sentence is a HOOK, never a topic announcement.
3. Second person, present tense, active voice.
4. One artifact = one objective.
5. Concrete and named over abstract and generic.
6. Activity verbs MUST match the Bloom verb of the objective.
</design_principles>

<style_constraints>
- Reading grade ≤ 9 unless audience justifies higher.
- Forbidden: "in today's fast-paced world", "leverage", "delve",
  "imagine you're a manager", "it is important to note".
- Average sentence ≤ 20 words; ≤ one subordinate clause.
- Passive voice only when actor is genuinely unknown.
</style_constraints>

<output_format>
Return ONLY valid JSON matching {schema}. No prose wrapper.
</output_format>

<self_check>Run the checklist below before responding. {checklist}</self_check>
```

Anthropic-specific guidance: XML tags outperform markdown headings with Claude; the most load-bearing constraint should appear last (recency bias improves adherence); specify tone concretely ("warm, specific, uses contractions") rather than generically ("conversational").

## Prompt patterns for scenario-based content

The single biggest failure mode in AI-generated scenarios is genericness. The counter-pattern: **require a named, specific, conflicted brief *before* generation.**

```
Before writing the scenario, complete this brief:
CHARACTER: name, role, one quirk, one constraint
EVENT: specific incident with date/time and tangible artifact
(an email, Slack message, missed deadline)
STAKES: what goes wrong on worst choice; who is affected
GREY AREA: the judgment that has no clean answer (state both sides)
COMMON WRONG MOVE: the plausible mistake an experienced person
actually makes here + the cognitive bias driving it

Now generate a 3-decision branching scenario where:
- D1 = gather info vs act
- D2 = tone choice in communication
- D3 = recovery from earlier sub-optimal choice

CONSEQUENCES continue the story (dialogue, email, body language).
Never: "Correct!/Incorrect!"
```

This is an applied chain-of-thought pattern (Wei et al., 2022, *arXiv 2201.11903*): forcing the model to commit to specifics as intermediate reasoning anchors downstream generation and prevents stock-scenario drift.

## Prompt patterns for role-based learner variation

Parameterise the learner so the same objective produces different artifacts per audience.

```xml
<learner_profile>
  <role>{job_title}</role>
  <years_experience>{n}</years_experience>
  <daily_tools>{list}</daily_tools>
  <success_metric>{what they're measured on}</success_metric>
  <vocabulary_level>{novice|intermediate|expert}</vocabulary_level>
  <typical_blockers>{2–3 real obstacles}</typical_blockers>
  <motivation>{intrinsic driver for this learning}</motivation>
</learner_profile>

Adapt:
- Examples reference {daily_tools}
- Hook speaks to {motivation}, not generic "career growth"
- Difficulty calibrates to {years_experience}
- Vocabulary matches {vocabulary_level} — define jargon only below level
```

For multi-audience pipelines, **run the same prompt N times with different profiles** rather than asking one call for N versions. Cheaper in tokens, more accurate, and parallelisable.

## Structured output for learning artifacts

Treat the model's output as an API contract. Native structured-output modes (OpenAI Structured Outputs, Anthropic tool-use schemas) deliver > 99% schema adherence. Without native support, include the JSON Schema in the prompt, post-validate with a JSON-schema library, and run a capped repair loop on failures.

**Flashcard schema:**
```json
{ "type":"object",
  "required":["front","back","bloom","tags"],
  "properties":{
    "front":{"type":"string","maxLength":120},
    "back":{"type":"string","maxLength":200},
    "bloom":{"enum":["remember","understand"]},
    "tags":{"type":"array","items":{"type":"string"}},
    "common_confusion":{"type":"string"},
    "source_objective":{"type":"string"}}}
```

**MCQ schema:**
```json
{ "type":"object",
  "required":["stem","options","key","bloom","distractor_rationales"],
  "properties":{
    "stem":{"type":"string"},
    "options":{"type":"array","minItems":3,"maxItems":4,
               "items":{"type":"string"}},
    "key":{"enum":["A","B","C","D"]},
    "bloom":{"enum":["remember","understand","apply","analyze"]},
    "distractor_rationales":{"type":"object"},
    "haladyna_checks":{"type":"object",
      "properties":{
        "central_idea_in_stem":{"type":"boolean"},
        "options_parallel":{"type":"boolean"},
        "no_absolute_qualifiers":{"type":"boolean"},
        "distractors_plausible":{"type":"boolean"}}}}}
```

**Scenario schema:**
```json
{ "objective":"string",
  "setup":"string ≤180 words",
  "characters":[{"name":"","role":"","motive":""}],
  "decision_points":[{
    "id":"d1","prompt":"","options":[
      {"text":"","is_best":false,"why_tempting":"",
       "consequence_narrative":"","next_node":"d2"}]}],
  "endings":{"best":"","acceptable":"","poor":""}}
```

Set **temperature 0–0.3 for structured fields**; raise to 0.6–0.8 for the creative prose fields only, and merge. Cap repair attempts at 2.

## Quality checks AI should run before returning

Embed a self-check list the model runs silently. Anthropic's docs note Claude follows explicit checklists far better than vague "be high quality" instructions.

```
<self_check>
Before returning, verify ALL checks pass. If any fails, revise silently
and re-check. Max 2 revisions. If still failing, return best attempt
with a "warnings" array listing the failed checks.

[ ] Hook test: Does the first sentence make me want to read the second?
[ ] Concreteness: ≥ 1 named character/tool/number per 100 words.
    No "imagine you're a manager."
[ ] Bloom alignment: Activity verbs match the objective verb.
    (Objective says "apply" → learner must DO, not RECALL.)
[ ] Voice: ≤ 10% passive sentences.
[ ] Length: within time_budget ± 20%.
[ ] Forbidden phrases absent.
[ ] Application moment: ends with one thing the learner does/decides/commits to.
[ ] Dialogue realism (scenarios): Read aloud — would a real person say this?
[ ] Schema validates.
</self_check>
```

For high-stakes content, run a **second-pass critic** in a separate API call: "You are a skeptical L&D reviewer. Score 1–5 on hook, concreteness, Bloom alignment, voice, application. List specific edits." Feed critique + original back to a final writer pass.

## Common failure modes and counter-prompts

| Failure | Symptom | Counter-prompt |
|---|---|---|
| Generic / stock scenarios | "Imagine you're a manager"; no named company, no artifact | Require the pre-brief (character, event, stakes, grey area, wrong move) |
| Passive-voice overuse | "It should be noted that the form is to be completed" | Constraint: ≤ 10% passive; prefer "You complete the form" |
| Missing hooks | First sentence = topic announcement | "First sentence must be question, surprise, or in-medias-res scene" |
| Missing application moment | Ends with summary or "Congratulations!" | Require `application_moment` field: one thing the learner does next |
| Verbose instructional language | "It is important to note that, in many cases…" | Forbidden-phrase list; max sentence length; word budget |
| Unrealistic dialogue | Characters narrate policy at each other; no contractions | "Read each line aloud. If a real person wouldn't say it, rewrite" |
| Bloom-level drift | Objective says Apply; item asks "What is the definition…" | Require model to label Bloom verb of each item and the objective; flag mismatch |
| Hallucinated citations | Fake authors, invented page numbers | Forbid citations the model can't verify; or RAG-ground |
| Sycophancy | "Great question!"; "Absolutely!" | "No flattery. No exclamation marks except in dialogue" |
| Mode collapse to "AI voice" | Predictable rhythm, list-heavy, balanced "on-the-other-hand" tone | Prime with 2–3 few-shot examples in desired voice; raise temperature on prose |

## Chaining prompts for multi-artifact pipelines

Generating a flashcard set + scenario + knowledge check from one objective is best done as a **chain**, not a mega-prompt. Each step has narrower scope, better schema adherence, and independent re-runability.

```
Step 1 — DECOMPOSE (temp 0.4)
  in:  objective + audience
  out: {key_concepts, common_misconceptions,
        observable_behaviours, decision_grey_areas}

Step 2 — FLASHCARDS (temp 0.2)
  in:  key_concepts + misconceptions
  out: 8–12 flashcard JSON

Step 3 — SCENARIO (temp 0.7)
  in:  grey_area + behaviours + named character brief
  out: 3-decision branching scenario JSON

Step 4 — KNOWLEDGE CHECK (temp 0.2)
  in:  misconceptions (become distractors)
  out: 5 MCQs, Haladyna-validated

Step 5 — CRITIC PASS (temp 0.3)
  in:  all artifacts + objective
  out: revisions + final bundle

Step 6 — PACKAGE
  bundle + manifest
```

Why this beats a mega-prompt: each step's schema is small (high adherence); Step 1's decomposition is reused across artifacts (the same misconception powers a flashcard's `common_confusion`, an MCQ distractor, and a scenario wrong-option); each step is independently cacheable, retryable, and human-reviewable; maps cleanly to agentic tool-use patterns in OpenAI and Anthropic SDKs.

## Few-shot examples for learning content

Few-shot prompting (Brown et al., 2020, GPT-3 paper) often outperforms zero-shot by large margins. For learning content, few-shots double as style anchors. Include 2–3 verbatim exemplars in the system prompt.

**Example 1 — Flashcard with disambiguation.**
```json
INPUT: "DHCP lease" for junior IT support
OUTPUT: {
 "front":"What does a DHCP server hand out, and for how long by default?",
 "back":"An IP address (plus subnet mask, gateway, DNS) leased for 24 hours by default on most consumer routers.",
 "common_confusion":"Learners often say 'a MAC address' — DHCP assigns IPs, not MACs.",
 "bloom":"remember","tags":["networking","DHCP"]}
```

**Example 2 — Scenario decision point.**
```json
INPUT: "delivering critical feedback to a defensive direct report"
OUTPUT: {
 "setup":"It's 4:47pm Thursday. Priya, your senior analyst of 4 years, just sent the Q3 deck to the client — with last quarter's revenue numbers still on slide 12. The client's CFO replied-all: 'Are these figures correct?' Priya is now standing in your doorway, arms crossed.",
 "prompt":"What do you say first?",
 "options":[
  {"text":"\"Don't worry, I'll handle the client. Let's just move on.\"",
   "is_best":false,
   "why_tempting":"Avoids conflict; protects Priya's feelings short-term.",
   "consequence":"Priya nods and leaves. Two weeks later she ships another deck with a similar error. The CFO escalates."},
  {"text":"\"Walk me through what happened — what was the version-control step?\"",
   "is_best":true,
   "why_tempting":"Curious, blame-light, focused on the system.",
   "consequence":"Priya uncrosses her arms. 'I pulled the wrong file from the shared drive — there's no naming convention.' You've found a fixable cause."},
  {"text":"\"This is the third mistake this quarter, Priya. We need to talk about your attention to detail.\"",
   "is_best":false,
   "why_tempting":"Feels honest and direct.",
   "consequence":"Priya's jaw sets. 'Fine.' She doesn't speak at tomorrow's standup. HR pings you Friday."}]}
```

**Example 3 — MCQ at Apply, Haladyna-clean.**
```json
INPUT: "Apply the rule of 72 to estimate investment doubling time" for new financial advisor associates
OUTPUT: {
 "stem":"A client invests $10,000 at an annual return of 6%. Using the rule of 72, approximately how many years until the investment doubles?",
 "options":["A) 6 years","B) 12 years","C) 16 years","D) 20 years"],
 "key":"B",
 "bloom":"apply",
 "distractor_rationales":{
   "A":"Confuses the rate with the answer.",
   "C":"Adds rather than divides.",
   "D":"Estimates from gut without applying the rule."},
 "haladyna_checks":{"central_idea_in_stem":true,"options_parallel":true,
   "no_absolute_qualifiers":true,"distractors_plausible":true}}
```

These exemplars force the model to match the structural details — named characters, dated events, distractor rationales — that distinguish pro-quality output from generic AI slop.

## Quick reference

- Layer system prompts: role → task → inputs → principles → style → format → self-check.
- Use XML tags for Claude; put load-bearing constraint last.
- Force a pre-brief before generating scenarios.
- Parameterise learner profile; run N prompts rather than asking for N versions.
- Structured outputs + schema validation + capped repair loop.
- Embed a silent self-check list; run a critic pass for high-stakes content.
- Chain prompts for multi-artifact bundles; reuse a shared decomposition.
- Seed with 2–3 few-shot exemplars in the desired voice and structural detail.
- Temp 0–0.3 for structured fields; 0.6–0.8 only for creative prose.

---

## Conclusion — how to use these seven modules

Load these modules independently. Module 1 (principles) and Module 7 (AI patterns) belong in every system prompt — they define the baseline quality floor and the prompt-engineering structure. Module 2 (frameworks) and Module 5 (motivation) are best retrieved into context when the objective is non-trivial and requires choosing a pedagogical approach. Module 3 (gamification) loads when a game-flavoured artifact is requested. Module 4 (accessibility) belongs in every content-generation call as a constraint check. Module 6 (formats) loads when the artifact type has been selected — it becomes the generation template.

The design philosophy that runs through all seven: **small, specific, and sound.** Small because attention is a scarce resource. Specific because generic content does not teach. Sound because the research of the last fifty years already tells us what works — AI's job is to operationalise it at scale, not reinvent it.
