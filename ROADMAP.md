# Roadmap

What's planned, roughly in priority order. Each item is written so it can become a GitHub issue. Comment on one if you'd like to take it on.

## Next up

### Trim leftover types and store state
Earlier versions of the app had separate tools for outlines, design documents, QA analysis, and generators. Their screens are gone, but `types.ts` and `store.ts` still hold their types and state. Remove what nothing uses, with a store migration for any saved keys.

### Bring back the useful analysis checks
These were part of earlier versions and are worth rebuilding on the current pipeline: a style check that reads the active markdown guide, an accessibility check against the design document, and a Bloom's verb-drift analysis for the outline. Each should work on committed artifacts and report findings as Critical, Recommended, and Style guide gaps.

### Assessment item bank stage
An optional stage after the design document that drafts exam and knowledge-check items. Each item needs a clear stem, plausible distractors based on real misconceptions, an answer key that explains every option, and tags for objective and cognitive level. A reviewer pass should catch weak stems, cueing, and ambiguous keys.

### SME review packets
Turn the open questions from intake and needs analysis into a short, SME-friendly review packet: numbered questions, why each one matters, and space for answers. Optionally fold SME answers back into the next generation.

### Export to DOCX and PDF
Export any committed artifact for review outside the app, with headings and tables intact.

## Quality and trust

### More tests
The parsers and loaders have unit tests. Add tests for the provider layer (with a mocked API), the store's stage transitions, and the chat revision flow.

### Plain-language and AI-tell pass
An optional final pass over learner-facing text that removes filler, stacked triads, and other machine-written patterns while keeping meaning and the active style guide intact.

### Sample project
Ship an example project with realistic source materials and committed example outputs, so people can see the pipeline's value before adding an API key.

## Later

- A build step for custom interactive components, only after there is a way to preview and test them in SCORM Cloud
- A review process for vendor facts in the Rise and LMS knowledge files, with a last-verified date on each
- More LMS profiles
- Cloud storage import (Google Drive, Dropbox)
- A real database option for persistent, multi-device use
- Team collaboration and comments
- LMS export (SCORM 1.2, SCORM 2004, xAPI)
- Transcription for audio and video source materials
- Per-project style guide selection
- Mobile-friendly canvas
