# Security policy

## Reporting a vulnerability

Please report security problems privately. Use GitHub's "Report a vulnerability" button on the Security tab of this repository. Please don't open a public issue for a vulnerability.

Include what you found, the steps to reproduce it, and the impact you expect. You'll get a reply within seven days.

## What to know before you run this app

- **API keys live in a local file.** The app stores keys in `.claude-secrets.json` in the project root, with owner-only permissions. The file is gitignored. Never commit it or share it.
- **The app is built for one person on one machine.** It has no sign-in, no multi-user separation, and no hosted mode. Don't expose the dev server to the public internet.
- **Your content goes to an AI provider.** Source materials and prompts are sent to the provider you choose (Anthropic or Google). Don't upload material you aren't allowed to share with that provider.
- **Project data is stored in your browser.** Projects, stage artifacts, and chat history are kept in local storage. Clearing site data removes them.
