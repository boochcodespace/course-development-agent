# Content format library

Nine tapas-style formats the AI tool generates. Each entry specifies: purpose, length, Bloom fit, accessibility, gamification potential, and an example prompt structure. Use this module as a menu: given a learning objective and Bloom level, pick the format whose fit is strongest.

## 1. Flip card decks

**Purpose.** Active retrieval practice via two-sided cards. Exploits the testing effect (Karpicke & Roediger, 2008) plus spaced repetition (Cepeda et al., 2006).

**Ideal length.** One atomic fact per card; front ≤ 20 words; back ≤ 25 words. Decks of 15–30 cards per session; 50–200 per topic.

**Bloom fit.** Remember, Understand. Weak for Apply unless paired with scenario cards.

**Scheduling algorithms.** Leitner system (1972) for physical/heuristic use; SM-2 (Wozniak, 1985) for Anki/SuperMemo; FSRS (Anki ≥ 23.10) for modern ~90% retention targeting.

**Accessibility.** Keyboard-navigable (space to flip, arrow to advance); ≥ 16 px font; image cards need alt text; audio for language decks; no timer pressure.

**Gamification.** Streak counters, mastery badges per Leitner box, XP per correct retrieval, consistency leaderboards. Avoid speed scoring — it harms retrieval depth.

**Prompt structure.**
```
Generate {N} atomic flashcards on {topic} for {role/level}.
Each card: one fact only. No compound questions.
Output JSON: [{"front","back","tags","difficulty","common_confusion"}]
Rules: Front ≤ 20 words; back ≤ 1 sentence.
Reject any card answerable without studying.
```

## 2. Scenario-based micro-lessons with branching

**Purpose.** Decision-tree narratives for judgment-under-ambiguity skills — conversations, triage, ethics, escalation. Leverages Green & Brock (2000) narrative transportation.

**Ideal length.** Single-decision mini: 2–3 min. Branching (per Cathy Moore): ~7 decision points per path; total 8–15 min.

**Bloom fit.** Apply, Analyse, Evaluate. Uniquely suited to grey-area judgment; cannot be substituted by MCQs.

**Accessibility.** Branching transcript as linear alternative; keyboard-reachable decisions; no timed choices; describe non-verbal cues in text; captions on all video/audio.

**Gamification.** Hidden cumulative scoring, multiple endings (best/acceptable/disaster), replay to unlock alternate roles, trust/relationship gauges. Avoid visible score during play — pulls learner out of role.

**Prompt structure.**
```
ROLE: Scenario designer.
Before generating, fill in: character (name, quirk, constraint),
precipitating event (date/time/artifact), stakes, grey area,
common wrong move (plausible mistake + bias behind it).
Then: 3-decision branching scenario. Consequences = next story
beat (dialogue, email, body language), not "Correct/Incorrect."
Output JSON tree.
```

## 3. Knowledge checks (MCQ, image, drag-and-drop)

**Purpose.** Formative retrieval that causes learning, not just measures it.

**Ideal length.** 3–10 items per check; 2–5 minutes; stems ≤ 30 words; options ≤ 8 words.

**Bloom fit.** With care, can reach Apply/Analyse; most practitioner MCQs drift to Remember.

**Design rules (Haladyna, Downing & Rodriguez, 2002 — 31 guidelines, 2002, *Applied Measurement in Education* 15(3)):** central idea in stem; options grammatically parallel and similar length; distractors based on documented misconceptions; three well-functioning options often beat four or five; no "all/none of the above"; avoid negative stems unless bolded; randomise key position.

**Image-based.** Embed image in stem; ask identify/classify/diagnose; alt text describes the task, not the answer.

**Drag-and-drop matching.** 4–7 pairs max; provide dropdown alternative for keyboard users.

**Accessibility.** Screen-reader announces correctness + explanation; no color-only signalling; zoom-safe images; removable timers.

**Gamification.** Confidence-weighted scoring (stake confidence; surfaces overconfidence); boss-level mixed checkpoints; immediate explanations rather than score-only.

**Prompt structure.**
```
Apply Haladyna 31 guidelines. Generate {N} MCQs at Bloom: {Apply}.
Each: stem = realistic situation + direct question;
1 key + 3 distractors; parallel grammar; similar length;
each distractor maps to a documented misconception (state it).
Self-check: could a savvy test-taker eliminate without content knowledge?
If yes, rewrite. Does the Bloom verb match the activity? Verify.
Return JSON with "distractor_rationales" and "bloom" fields.
```

## 4. Mini games (quiz-show, challenge, decision-tree)

**Purpose.** Competitive wrappers (Jeopardy board, Millionaire ladder, timed sprint) that repackage retrieval with stakes and pacing.

**Ideal length.** 5–10 min sessions; 10–20 questions; escalating difficulty.

**Bloom fit.** Mostly Remember/Understand. Decision-tree variants reach Apply.

**Design note.** Reserve speed-based formats for over-learning *after* concept mastery — time pressure harms acquisition of complex material but reinforces fluency.

**Accessibility.** Always offer no-timer mode; ARIA-labelled boards; no strobing (WCAG 2.3.1 — three flashes/sec).

**Gamification potential.** Already game-formatted; layer team play, daily challenges, cohort-bounded leaderboards.

**Prompt structure.**
```
Build a 5-category Jeopardy board on {topic}.
Each category = 5 clues at $200–$1000 difficulty (Remember→Apply).
Each clue unambiguously answerable; no overlap.
Teaching explanations after each answer, not just confirmation.
Output JSON: {"categories":[{"name","clues":[{"value","clue","response","explanation"}]}]}
```

## 5. Cheat sheets and job aids

**Purpose.** Reference artifacts used *at* the moment of need. Distribute cognition into the environment (Hutchins, *Cognition in the Wild*).

**Rossett & Schafer's (2007) typology.** *Sidekicks* — used during the task (checklist, decision table, GPS-style prompt). *Planners* — used before/after (prep worksheet, debrief template). Functional categories: execute steps, make decisions, access information.

**Ideal length.** Single screen / single printed page. Scannable in < 30 sec. If it doesn't fit, decompose.

**Bloom fit.** Bypasses memorisation. Frees working memory for higher-order judgment.

**Design rules.** Design the job aid before designing surrounding training. Start from observed task, not SME mental model. Protocol-analysis with 3–5 users. Visual hierarchy matches structure type: numbered steps for procedures; 2-column decision tables for conditional logic; flowcharts for branching; labelled diagrams for reference.

**Accessibility.** True text (never flattened image of text); contrast AA 4.5:1; Grade 8 language; print and mobile renders; offline-available; multilingual where workforce requires.

**Gamification.** Generally inappropriate — job aids should be frictionless. Track adoption silently.

**Prompt structure.**
```
Create a {sidekick|planner} for: {task moment}.
Choose structure: procedural → numbered checklist;
conditional → decision table; branching → mermaid flowchart;
reference → labelled diagram.
Output Markdown fitting one A4. ≤ 7 chunks. Imperative voice.
Flag 1–2 common error points with ⚠. No background theory.
```

## 6. Micro-podcasts and audio scripts

**Purpose.** 3–5 min audio episodes delivering a single insight in conversational tone. Consumed in transit, exercise, between meetings.

**Ideal length.** 3–5 min (~450–750 words at 150 wpm). Hard cap: 7 min.

**Bloom fit.** Remember/Understand. Weak for Apply without a follow-up prompt.

**Script structure.** Hook (15 sec) → Promise (15 sec) → Core story + framework (3 min) → Takeaway + nudge (30 sec). Second person, contractions, rhetorical questions, signposting.

**Accessibility.** Full transcript + 200-word summary; chapter markers; playback speed control; no startle cues.

**Gamification.** Listening streaks; post-episode knowledge check; "earn the next episode by acting on this one."

**Prompt structure.**
```
Write a 4-minute podcast script on {topic} for {audience}.
Single takeaway: {insight}.
Beats: HOOK → PROMISE → ONE STORY → ONE FRAMEWORK → TAKEAWAY → NUDGE.
Rules: 2nd person, contractions, avg sentence ≤ 18 words,
one named fictional example, no jargon unexplained.
End with a 7-word action for today.
Output: script + ≤80-word summary + 3 quiz Qs.
```

## 7. Visual explainers and infographic scripts

**Purpose.** Single-image or short-scroll artifacts compressing a concept, process, or comparison into glanceable form.

**Ideal length.** One scroll; ≤ 7 visual chunks; ≤ 2 min reading.

**Bloom fit.** Understand (relationships, comparisons). Strong for systems thinking.

**Design principles (Roam, 2008, *The Back of the Napkin*).** 4-step process: Look → See → Imagine → Show. **⟨6⟩⟨6⟩ rule** — six question types map to six visual structures:

| Question | Visual |
|---|---|
| Who / What | Portrait / object |
| How much | Chart |
| When | Timeline |
| Where | Map |
| How | Flowchart |
| Why | Multi-variable plot |

Tufte principles: maximise data-ink ratio, eliminate chartjunk, no 3D or decorative gradients.

**Accessibility.** Long-text alternative describing structure + insight; colour-blind-safe palette (ColorBrewer); minimum 12 pt body, 18 pt headline; logical reading order.

**Gamification.** Interactive "build-your-own"; quiz overlays; shareability.

**Prompt structure.**
```
Classify the question type (who-what/how-much/when/where/how/why)
and pick matching visual structure. Apply SQVID.
Output infographic script:
{"headline":"insight as a claim, not a label",
 "visual_structure":"...", "panels":[...],
 "alt_text_long":"structure AND insight in ≥80 words",
 "callout":"the one thing to remember"}
Headline must be a claim ("Refunds spike on Mondays"), not a topic.
```

## 8. Two-minute skill blocks (TikTok-style video)

**Purpose.** 45–120 sec vertical video demonstrating one observable micro-skill. Optimised for mobile, captions-on, sound-off default.

**Ideal length.** 60–90 sec sweet spot; hard cap 2 min.

**Bloom fit.** Apply (procedural skills) and Remember (mnemonics). Not suited to Analyse/Evaluate.

**Format conventions.** First 3 seconds = pattern interrupt (show the end result first, not an intro). Show, don't tell — voiceover labels the steps. Captions burned in; 80%+ of mobile views are sound-off. One skill, one take. Vertical 9:16. End on a three-frame recap card.

**Accessibility.** Burned-in captions + separate SRT; audio description track for visual-only demos; published transcript; no rapid cuts > 3/sec for vestibular safety; flash-safe.

**Gamification.** Skill-of-the-day series; micro-credentials per 5 completed + demonstrated; user "duet" submissions.

**Prompt structure.**
```
75-second vertical video on ONE skill: {skill}. Audience: {role}.
Shot list columns: TIME | VISUAL | VOICEOVER | CAPTION.
0:00–0:03 Hook — end result first, no intro.
0:03–0:15 The mistake.
0:15–0:55 3-step demonstration.
0:55–1:10 Why it works (one-sentence mechanism).
1:10–1:15 Recap card — 3 words, 3 icons.
VO ≤ 180 words. Captions ≤ 5 words per frame.
Recap must work without audio.
```

## 9. Nudge-style reinforcers

**Purpose.** Tiny timely prompts (push, SMS, email, in-app banner) that reinforce prior learning or cue a behaviour at the moment of need. Grounded in Thaler & Sunstein's (2008) choice architecture.

**Ideal length.** ≤ 25 words; one CTA; one tap.

**Bloom fit.** Trigger Apply or Remember. Not for first-time concept teaching.

**Design heuristics.** **EAST** (UK Behavioural Insights Team): Easy, Attractive, Social, Timely. Just-in-time > fixed schedule. Expanding-interval reminders (Day 1, 3, 7, 21, 60). Personalise to prior performance. Cap at 3–4/week to avoid fatigue. Google's Whisper Courses (weekly one-tip manager emails) is the canonical case.

**Accessibility.** Don't rely on emoji-only meaning; respect Do Not Disturb; large-font-friendly; SMS option for non-smartphone users; quiet-hours per timezone.

**Gamification.** Reflection streaks; habit progress bars; social proof ("83% of peers completed this"). Avoid manufactured urgency or FOMO.

**Prompt structure.**
```
Behavioural-science copywriter generating learning nudges.
Inputs: behaviour, trigger context, channel, prior learning.
3 variants applying EAST + one of [loss aversion, social proof,
implementation intention, curiosity gap].
Constraints: ≤20 words push/SMS, ≤8 words email subject;
ONE concrete action verb; no fake urgency or shame framing.
Output JSON with "principle" and "predicted_friction" fields.
```

## Quick reference — format selector

| Learning need | Best format(s) |
|---|---|
| Memorise vocabulary, facts, regs | Flip cards, micro-podcast |
| Recognise patterns, compare concepts | Visual explainer, knowledge check |
| Apply a procedural skill | Two-minute skill block, job aid |
| Calibrate judgment in grey areas | Branching scenario, decision-tree mini-game |
| Reinforce learned behaviour in context | Nudge-style reinforcer |
| Drill fluency after mastery | Quiz-show mini-game, timed sprint |
| Support at the moment of need | Job aid (sidekick) |

---
