# LMS profile: generic SCORM, xAPI, or cmi5

Use this profile when the spec's `lms_target` is `generic` or the LMS is unknown. When the LMS is known and has its own profile, read that one as well.

> **Verify before you rely on this.** Confirm supported standards and limits in your LMS's current documentation, and test with your LMS administrator.

## Choosing a publish standard

Ask which standards the LMS supports, then choose:

| Standard | Suspend data limit | When to use it |
|---|---|---|
| SCORM 2004 3rd Edition | 64,000 characters | Default where supported. Separate completion and success status. Safer for longer Rise courses. |
| SCORM 1.2 | 4,096 characters | Maximum compatibility, but Rise progress can be lost on longer courses. Use only for short courses. |
| xAPI | No equivalent limit (stored in a learning record store) | Richest data, but LMS reporting often surfaces it poorly. Needs an LRS or API access. |
| cmi5 | Not applicable | Modern xAPI profile. Check LMS support before choosing it. |

Do not choose SCORM 2004 4th Edition unless you have confirmed your LMS supports it. Support is uneven.

Rise 360 uses a lot of suspend data even with compression, and Rise always resumes, so SCORM 1.2 courses can run out of suspend data after a few pages of scrolling.

## Tracking fidelity, richest to simplest
1. xAPI or cmi5: richest data, needs an LRS or API access to use well
2. SCORM 2004 3rd Edition: reliable completion and success reporting
3. SCORM 1.2: most universal, smallest data ceiling

## What often works in preview but breaks in an LMS
1. External resources (CDN fonts, `http://` images, external scripts): LMSs often enforce HTTPS and strict content security policies
2. Video embeds: some fail inside nested iframes
3. `postMessage` to the parent window: the preview's parent is not the LMS's parent
4. Bookmark and resume: preview does not truly test SCORM bookmarking
5. Completion triggers: preview fakes completion, while the LMS needs real commit and finish calls
6. Cross-site cookies: some LMS players depend on them, and Safari blocks them by default
7. Quiz interaction reporting: some Rise tracking options drop detailed interaction data

## Migration gotchas
- Updating a Rise course can change lesson IDs and break resume for learners mid-course.
- "Restrict navigation" lessons can behave differently in the LMS than in preview.
- Learners may see two navigation menus (Rise's and the LMS's).
- LMS session timeouts mean only progress before the timeout is recorded.

## Questions to ask your LMS administrator
- Which SCORM editions and xAPI versions are supported?
- What is the maximum package size and file count?
- Are there content security policy or domain allowlist rules for embedded content?
- Is there a mobile app, and does it support offline or xAPI content?
