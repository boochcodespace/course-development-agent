---
name: style-guide-enforcer
description: >
  Apply and enforce a team style guide when creating or reviewing any content. Use this skill whenever the user asks to write, edit, review, or produce course materials, certification content, internal communications, web copy, or any learner-facing or stakeholder-facing text. Also trigger when the user mentions style guide, brand voice, writing standards, tone check, style review, formatting standards, or asks to check content against team conventions. Even casual requests like does this follow our style or clean this up to match our standards or review this for consistency should trigger this skill. This skill governs all content types including slides, handouts, learner guides, exam items, program descriptions, status updates, emails, FAQs, and web copy.
---

# Style Guide Enforcer

Apply a living, editable style guide to all content creation and review tasks. This skill ensures that everything produced or reviewed follows the team's established writing standards, terminology, formatting conventions, and tone guidelines.

## When to Use

**Creating content:**
- Writing course materials (slides, handouts, learner guides, facilitator notes)
- Drafting certification content (exam items, program descriptions, certification landing pages)
- Composing internal comms (status updates, leadership emails, project briefs)
- Producing web copy (program pages, FAQs, program overviews)

**Reviewing content:**
- Checking existing drafts against the style guide
- Auditing content for consistency before publishing
- Reviewing SME-contributed content for tone and formatting alignment
- Cleaning up legacy content to match current standards

## How This Skill Works

### For Content Creation

1. **Read the style guide** for the active guide (`style-guides/default/style-guide.md` unless the user chose a guide in `style-guides/custom/`) before writing anything. This file is the single source of truth. It is directly editable by the user and will evolve over time.
2. **Identify the content type** from the user's request (course material, certification content, internal comms, or web copy).
3. **Read the content-type-specific guidance** in the same folder's `content-type-rules.md`, if it exists, for any format-specific conventions that layer on top of the base style guide.
4. **Apply the guide** while writing. Don't mention or narrate the style rules in the output. Just follow them. The content should feel naturally well-written, not like it was run through a compliance filter.
5. **If a style question arises that the guide doesn't cover,** note it at the end of the response as a "Style Guide Gap" so the user can decide whether to add a rule.

### For Content Review

1. **Read the style guide** for the active guide (`style-guides/default/style-guide.md` unless the user chose a guide in `style-guides/custom/`).
2. **Read the content-type-specific guidance** in the same folder's `content-type-rules.md`, if it exists,.
3. **Review the content** the user provides and produce a Style Review Report (format below).
4. **Categorize each finding** by severity and type.
5. **Offer corrected versions** for each flagged item.

## Style Review Report Format

When reviewing content, present findings in this format:

```
## Style Review: [Content Title or Description]
**Content Type:** [Course Material / Certification / Internal Comms / Web Copy]
**Review Date:** [Date]

### Summary
[2-3 sentences: overall impression, how closely the content follows the guide, and the most common issue category.]

### Findings

#### Critical (Must Fix)
These violate hard rules in the style guide and need to be corrected before publishing.

1. **[Issue]**
   - **Location:** [Where in the content]
   - **Current:** "[What it says now]"
   - **Suggested:** "[What it should say]"
   - **Rule:** [Which style guide rule this violates]

#### Recommended (Should Fix)
These don't break hard rules but would improve consistency and clarity.

1. **[Issue]**
   - **Location:** [Where in the content]
   - **Current:** "[What it says now]"
   - **Suggested:** "[What it should say]"
   - **Rule:** [Which style guide convention this relates to]

#### Style Guide Gaps
Issues encountered where the style guide has no clear rule. Consider adding guidance for these.

1. **[Issue]:** [Description of the ambiguity and a suggested rule]

### Score
**Adherence:** [High / Medium / Low] - [Brief justification]
```

## Severity Definitions

**Critical (Must Fix):** The content uses incorrect terminology, contradicts established brand voice, contains formatting that breaks conventions, or introduces confusion for the target audience. These aren't style preferences; they're rules the team has explicitly agreed on.

**Recommended (Should Fix):** The content is technically acceptable but would benefit from revision for consistency, clarity, or polish. These are conventions that make the content feel cohesive across the team's output.

**Style Guide Gaps:** The reviewer encountered a situation where no rule exists. These are opportunities to evolve the guide. Flag them so the user can decide whether to codify a new rule.

## Working with the Style Guide File

The style guide lives for the active guide (`style-guides/default/style-guide.md` unless the user chose a guide in `style-guides/custom/`). This is the user's file to own and update. The skill reads it fresh every time it's triggered, so changes take effect immediately.

The file is organized into 13 numbered sections covering:
- **Ampersand, Bold, Capitalization** (Sections 1-3) - Formatting and visual conventions
- **Colons, Contractions** (Sections 4-5) - Punctuation and tone mechanics
- **May vs. Might, Sign In/Out, Slash** (Sections 6-8) - Word choice rules
- **Tone and Voice, UI Elements, US Spelling** (Sections 9-11) - Voice, interface references, and locale rules
- **Quick Decision Guide** (Section 12) - Fast-reference lookup table for common questions
- **Flagged Ambiguities** (Section 13) - Areas not yet covered that need team decisions

When the user wants to add or change a rule, they can edit the file directly. The skill will pick up the changes on the next use. If the user provides a new rule conversationally (for example, "from now on, we capitalize 'Planner' when referring to a role"), the skill should suggest the exact text to add to the style guide file so the rule persists.

## Suggesting Style Guide Updates

When a review surfaces a gap, or the user mentions a new convention, propose an addition in a copy-paste-ready format:

```
### Suggested Addition to Style Guide

**Section:** [Which section it belongs in]
**Rule:**
[The rule, written in the same format as existing entries in the guide]

**Rationale:** [Why this rule is useful]
```

This makes it easy for the user to drop new rules into the file without having to reformat anything.

## Integration with Other Skills

This skill plays well with others. When used alongside the-interviewer or any course creation workflow, the style guide should be applied as a final quality pass. The other skills handle structure and pedagogy; this one handles voice, terminology, and formatting consistency.

## Keywords
style guide, brand voice, writing standards, tone, formatting, terminology, style review, content review, consistency check, editorial standards, writing conventions, style check, copy editing, content audit, formatting standards
