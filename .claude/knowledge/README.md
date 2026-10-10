# Knowledge library

The agents reason with the files in these folders. They are plain Markdown, so you can read them, edit them, and add your own.

| Folder | Read by | What it holds |
|---|---|---|
| `course-outline/` | Course Outline stage | Taxonomies and instructional design frameworks (Bloom, Webb, Fink, SOLO, Marzano, and more), plus the outline template |
| `shared/` | Design Document, QA, and Dev Support stages | Scaffolding, storyboarding, and agile design guidance |
| `content-writing/` | Content Draft stage | Writing patterns for Rise 360 and ILT slides, speaker notes, and Bloom's alignment cues |
| `rise-spec/` | Interactive spec tool and Dev Support stage | Rise 360 Code Block constraints, interaction patterns, accessibility checklist, the 16-section spec template, and LMS profiles |

## How files are loaded

- A stage that needs a whole folder loads every file in it.
- Some tasks load only the files they need, to keep prompts small. The Content Draft stage loads different files for Rise and for ILT. The Interactive spec tool loads one LMS profile, and adds `learning-science.md` only when you ask for it. The lists live in `src/lib/content-draft.ts` and `src/lib/rise-spec.ts`.
- A test checks that every file named in code exists, so a typo fails CI.

## Vendor facts age quickly

`rise-spec/rise-constraints.md` and the LMS profiles describe how Articulate Rise 360, the Mighty extension, and specific LMSs behave. That was compiled from vendor documentation and community testing in 2025 and 2026. Vendors change products often. Treat these files as a starting point, check current documentation, and test in your own LMS.

## Add an LMS profile

1. Create `rise-spec/lms-<id>.md`. Start from `lms-generic.md`.
2. Add an entry to `LMS_PROFILES` in `src/lib/rise-spec.ts`.
3. Run `npm test`. It confirms the file exists.

## Writing style is not in these files

Keep house style in a style guide (see `style-guides/README.md`), not in the knowledge files. The active guide is added to every prompt.
