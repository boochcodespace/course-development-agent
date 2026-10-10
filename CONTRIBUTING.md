# Contributing

Thank you for helping make this better. Instructional designers and developers are both welcome.

## Ways to contribute

- **Try it and tell us what happened.** A clear bug report or "this confused me" note is a real contribution.
- **Improve the agents.** Each pipeline stage has a plain-language spec in `.claude/agents/`. You can improve one without writing any code.
- **Add knowledge.** Frameworks and reference modules live in `.claude/knowledge/`. Cite your sources.
- **Add an LMS profile.** Copy `.claude/knowledge/rise-spec/lms-generic.md`, adjust it, and register it in `src/lib/rise-spec.ts`. Cite where each fact came from.
- **Share a style guide.** Add a folder to `style-guides/` with a `style-guide.md` file. See `style-guides/README.md`.
- **Fix code.** The app is Next.js 14, TypeScript, Zustand, and Tailwind.

## Set up

```bash
git clone https://github.com/boochcodespace/course-development-agent.git
cd course-development-agent
npm install
npm run dev
```

Open http://localhost:3000 and add an API key in **Settings**.

## Before you open a pull request

Run the same checks CI runs:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Then:

1. Keep the change focused. One idea per pull request.
2. Describe what changed and why. Add a screenshot for any visible change.
3. Don't commit secrets, uploaded files, or anything from `style-guides/custom/`.
4. If you change an agent spec, include a before and after excerpt of the output.

## Editing agent specs and knowledge files

- Write in plain language. A reader should be able to follow the spec without knowing the code.
- Don't hard-code a writing style into an agent. Style rules belong in a style guide.
- Keep one idea per knowledge file section, and name the source for any research claim.

## Questions

Open a discussion or an issue. There are no silly questions.

## A note on leftover types

`src/lib/types.ts` and `src/lib/store.ts` still contain types and state for features of an earlier version of the app that no longer have screens. They're harmless, and trimming them is on the roadmap. If you remove some, keep the saved-state shape in mind: the store persists to local storage, so removing a saved key needs a migration.
