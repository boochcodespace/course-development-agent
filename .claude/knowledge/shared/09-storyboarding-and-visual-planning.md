# Storyboarding and Visual Planning

A storyboard is where learning design stops being an idea and starts being a buildable artifact. For human IDs, it forces decisions before expensive development begins. For AI content generation, it is the structured intermediate representation that turns "write me a course" into something a developer, a designer, or a rendering pipeline can actually consume.

## A) Storyboarding as a learner content planning tool

### Why the storyboard matters

A storyboard locks four things simultaneously: **sequence**, **on-screen content**, **audio/narration**, and **interaction**. Once these are agreed, development is execution. Skipping the storyboard pushes all of those decisions into the authoring tool, where every change is 10× more expensive.

### Origin

The modern storyboard was developed at **Walt Disney Productions in the early 1930s**. Disney credited animator **Webb Smith** with the innovation of drawing individual scenes on separate sheets of paper and pinning them on a bulletin board to tell a story in sequence (Canemaker, 1999, *Paper Dreams: The Art and Artists of Disney Storyboards*, Hyperion; Finch, 1973, *The Art of Walt Disney*, Abrams). The first complete storyboards appear for **Three Little Pigs (1933)**. The technique spread across animation by 1937–38 and into live action with *Gone with the Wind* (1939). It migrated into UX design in the late 1990s and into eLearning as authoring tools matured in the 2000s.

### Types of eLearning storyboards

| Type | Best tools | Best for |
|---|---|---|
| **Text-based** | Word, Google Docs, Notion tables | Narrated courses, voiceover scripts, linear Rise/Storyline modules |
| **Visual (slide-based)** | PowerPoint, Google Slides, Keynote | Visual layout approval, client reviews, Storyline modules |
| **Interactive / branching** | Twine, Figma prototypes, PowerPoint with hyperlinks, Miro, BranchTrack | Scenarios, simulations, chat sims |
| **Audio/video shot-list** | Boords, FigJam, Canva, Storyboard That | Explainer videos, animated micro-lessons |
| **Wireframe-content hybrid** | Figma, SessionLab, four-column storyboard templates | Rise and custom HTML courses |

### Standard storyboard components

Consensus fields across Articulate community templates, Tim Slade's *The eLearning Designer's Handbook* (2nd ed., 2020), Cathy Moore's action-mapping method, Adobe Captivate templates, and Connie Malamed's eLearning Coach:

1. **Screen/frame ID**: number, module, title
2. **Learning objective reference**: which objective this screen serves
3. **On-screen text (OST)**: visible headings, body copy, labels
4. **Voiceover / audio script (VO)**: narration as spoken; "facilitator notes" for ILT
5. **Visuals / media**: images, video, characters, animation, icons
6. **Interactions / navigation**: buttons, triggers, drag-drops, quiz logic
7. **Branching logic**: next-screen paths for non-linear flow
8. **Feedback text**: correct/incorrect responses
9. **Developer / programming notes**: triggers, variables, states
10. **Accessibility notes**: alt text, captions, transcript cues
11. **Asset references**: file names, stock IDs
12. **Review status / version**

> **Design Tip, The default four-column template.** Slide ID | OST | VO | Visual + Interaction, with a fifth column for developer notes. Relabel VO as "Facilitator Notes" for ILT. Simple, portable, and it surfaces every decision that matters.

### Format-by-format storyboarding

**Linear micro-lesson.** Text or visual storyboard. Five to nine frames. Hook → key concept → worked example → practice → takeaway. Apply Mayer's multimedia principles at every frame.

**Branching scenario.** Twine is the tool of choice. **Cathy Moore's** action-mapping method begins with the business goal and the on-the-job action; map the ideal decision path first, then layer mistake branches with consequence-based feedback. **Christy Tucker** (*Experiencing eLearning*, Syniad Learning) recommends writing the ideal path in one pass, then adding 1–2 mistake branches per decision with natural consequences rather than "correct/incorrect" labels. She deliberately avoids templates for branching, they force artificial structure. Useful structures to reference (Sam Kabo Ashwell): **Time Cave**, **Branch-and-Bottleneck**, **Gauntlet**, **Loop-and-Grow**.

**Flip card deck.** A light text storyboard is enough: one row per card, front text, back text, optional media, tag for difficulty or topic. Design for spaced retrieval, not exposition.

**Job aid.** Storyboard the *decision the user faces on the job*, not the content. One column for trigger, one for action, one for check/verify, one for escalate.

**Video storyboard.** Frame-by-frame with visual column + audio column + shot type + duration. Keep scenes ≤ 8 seconds. Write VO for the ear, not the page.

### Tools worth knowing (2025)

- **Twine**: free, open-source; ideal for branching; Harlowe/SugarCube/Chapbook formats; exports to HTML; can ship finished scenarios. Cathy Moore and Christy Tucker both endorse.
- **Figma / FigJam**: FigJam has a native storyboard template; AI features cluster and generate; pairs with Figma component libraries for hi-fi prototypes.
- **Miro**: Miroverse hosts a well-known Learning Design Storyboard Template (Anja Vredeveld); strong for cross-functional whiteboard work.
- **Articulate Storyline 360**: "Story View" is itself a visual storyboard; Rise storyboarding is typically done in Word/Docs.
- **PowerPoint**: still the most common visual storyboard; hyperlinks + slide master produce a working branching prototype in hours.
- **Boords**: dedicated storyboard tool with frame thumbnails, versioning, an ID-specific template, and team review.
- **SessionLab**: color-coded blocks; excellent for blended and ILT.
- **Notion**: lightweight, collaborative, database-backed templates for text storyboards.
- **Emerging AI-native storyboarding**: LTX Studio, Shai Creative, Story-boards.AI, MakeStoryboard, and structured-output pipelines using Claude/GPT-4o with JSON schema.

### Common storyboarding mistakes

Common failure modes across SweetRush, iSpring, Boords, eLearningIndustry, and Litmos guides include wall-of-text frames over ~300 words, copy-pasting SME content without instructional massage, unnatural VO written as prose rather than speech, missing learning-objective tags per frame, vague developer instructions, monotonous repeated interactions, decorative "nice-to-know" visuals that violate Mayer's coherence principle, and over-reliance on templates for branching content. The most common meta-mistake: skipping the storyboard entirely and going straight to the authoring tool.

> **Design Tip, Apply Mayer's coherence and redundancy principles ruthlessly.** Never duplicate VO verbatim in OST. Cut decorative graphics, background music, and seductive details. Clark & Mayer's *e-Learning and the Science of Instruction* (4th ed., 2016) is the shortest path to a defensible storyboard review.

> **Design Tip, Write the ideal path of a branching scenario first.** Mistakes and consequences get layered on afterward. Designing every branch in parallel produces tangled flows and inconsistent feedback (Tucker; Moore).

## B) Storyboarding as an AI content generation output

The storyboard is the ideal intermediate representation for AI-generated learning content. It is structured enough to be validated programmatically, rich enough to be handed to a developer or a rendering pipeline, and readable enough for SME review.

### Prompt patterns that work

**Role + methodology + forbidden behaviors.** Following Dr. Philippa Hardman's guidance: generic "make me a storyboard on X" prompts yield the AI's average of existing ID practice, including debunked artifacts like "learning styles." You must specify the methodology and forbid known bad patterns.

> **Prompt Tip, The Hardman pattern.** *"You are an expert instructional designer. Using the attached source document only, draft a storyboard. Apply scenario-based learning, learners experience decisions, they do not consume content. Sequence using Gagné's Nine Events. Never reference learning styles. Cite only the attached source. Output as a markdown table: Slide # | Learning Objective | On-Screen Text | VO Script | Visual/Media | Interaction | Developer Notes."*

**Force structured output with JSON Schema.** OpenAI Structured Outputs and Anthropic tool-use JSON schemas are the current standards. A structured storyboard can be parsed into Storyline, imported into Rise, compiled into Twine Twee, or rendered to video by a downstream pipeline without re-prompting.

**Request the ideal path first, then mistakes.** For branching content, a two-stage prompt works better than a single stage: "Stage 1: output only the ideal path as 5 nodes. Stage 2: add 2 mistake branches per decision with consequence-based feedback."

**Demand a spoken-voice VO test.** "Write the VO as it would be read aloud in under 45 seconds per slide; no sentence over 20 words; contractions allowed." Prevents document-style narration.

**Constrain to source material.** "Only reference the attached document; do not introduce outside facts." Essential for compliance, regulated industries, and brand-voice work.

### Example JSON schema for an AI-generated eLearning storyboard

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ElearningStoryboard",
  "type": "object",
  "required": ["course", "screens"],
  "properties": {
    "course": {
      "type": "object",
      "required": ["title", "audience", "business_goal", "learning_objectives"],
      "properties": {
        "title": {"type": "string"},
        "audience": {"type": "string"},
        "duration_minutes": {"type": "integer"},
        "business_goal": {"type": "string"},
        "learning_objectives": {"type": "array", "items": {"type": "string"}},
        "modality": {"enum": ["self-paced","ILT","vILT","blended","micro","video"]}
      }
    },
    "screens": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["screen_id","title","objective_ref","on_screen_text","vo_script","visual","interaction","next"],
        "properties": {
          "screen_id": {"type":"string"},
          "title": {"type":"string"},
          "objective_ref": {"type":"string"},
          "on_screen_text": {"type":"string"},
          "vo_script": {"type":"string"},
          "visual": {
            "type":"object",
            "properties": {
              "description":{"type":"string"},
              "asset_ids":{"type":"array","items":{"type":"string"}},
              "layout":{"enum":["full-bleed","split","centered","diagram"]},
              "alt_text":{"type":"string"}
            }
          },
          "interaction": {
            "type":"object",
            "properties": {
              "type":{"enum":["none","click-reveal","drag-drop","hotspot","quiz","branch","scenario"]},
              "choices":{
                "type":"array",
                "items":{
                  "type":"object",
                  "properties":{
                    "label":{"type":"string"},
                    "feedback":{"type":"string"},
                    "next_screen_id":{"type":"string"},
                    "is_ideal":{"type":"boolean"}
                  }
                }
              }
            }
          },
          "developer_notes": {"type":"string"},
          "accessibility_notes": {"type":"string"},
          "next": {"type":"string"}
        }
      }
    }
  }
}
```

### Format-specific prompt shapes

**Video storyboard.** *"Generate a 60-second micro-lesson video storyboard. Return a JSON array of scenes. Each scene: scene_id, duration_seconds, shot_type, camera_angle, camera_movement, on_screen_visual, on_screen_text, vo_script, sfx, transition. Max 8 scenes, avg 7 seconds each."*

**Branching scenario tree.** *"Return JSON nodes = {id, passage_text, choices: [{label, next_id, consequence_tag}], ending: bool, feedback}. One ideal path, 4 decisions. Two failure paths. Output must parse into Twine Twee."*

**Micro-lesson frames.** *"Break the source doc into micro-lessons of ≤ 3 minutes. For each: action-verb learning objective, hook, one decision-and-consequence practice activity, one takeaway. Enforce Mayer's coherence and signaling principles."*

**Audio script with visual column.** *"Two columns: VO and Visual. VO written for the ear, ≤ 20 words per sentence. Visual column describes on-screen action synchronized to VO time-codes."*

### Structure enforces design principles

A well-structured storyboard forces good pedagogy by construction:

- A mandatory "hook" field in screen 1 forces an attention-grabbing opening
- A "pacing_seconds" field surfaces overloaded frames before build
- An "application_moment" flag forces at least one practice frame per micro-lesson
- An "accessibility_notes" field prevents alt-text afterthoughts

### Storyboard as handoff document

The AI-generated storyboard is not the final artifact, it is the *contract* between the AI pipeline and every downstream role: developer, visual designer, voice-over artist, accessibility reviewer, SME. Build the storyboard to the standard of the least-informed reviewer. Anything ambiguous will be built wrong.

## Quick Reference: Storyboarding

- **Origin:** Walt Disney Productions, early 1930s; Webb Smith credited; *Three Little Pigs* (1933).
- **Types:** text-based, visual, interactive/branching, audio-video shot-list, wireframe hybrid.
- **Default fields:** ID, objective ref, OST, VO, visual, interaction, branching logic, feedback, dev notes, accessibility notes, assets, version.
- **Default template:** 4 columns, Slide ID | OST | VO | Visual + Interaction, plus developer notes.
- **Branching:** ideal path first, then mistakes; Twine over templates (Moore, Tucker).
- **Top mistakes:** text walls, unnatural VO, skipped storyboards, over-detailing, monotony, missing accessibility.
- **AI prompting:** role + methodology + forbidden behaviors + JSON schema + source constraint.
- **Canonical reference:** Clark & Mayer (2016), *e-Learning and the Science of Instruction*, 4th ed.
