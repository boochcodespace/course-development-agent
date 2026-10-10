# LMS profile: Docebo

Use this profile when the spec's `lms_target` is `docebo`. It adds to `lms-generic.md` and to the hard publishing rules in `rise-constraints.md`.

> **Verify before you rely on this.** These details were compiled from Docebo documentation and community testing in 2025 and 2026. Limits, supported standards, and domains change. Confirm them in Docebo's current documentation and with your administrator.

## Publishing defaults for Docebo

1. **Default publish target: SCORM 2004 3rd Edition, not 4th.** Use SCORM 1.2 only for short courses (under seven lessons). Use xAPI only when you explicitly need it and you can query statements through the API or an external LRS.
2. **Send the final courtesy slide** that fires `LMSCommit` and sets `completion_status = completed` before relying on close.
3. **Test in SCORM Cloud first, then Docebo, in Chrome and Safari.**
4. **Do not add, remove, or reorder lessons after launch.** It breaks resume in Docebo.

## Docebo compatibility

### Supported standards
Docebo officially supports **SCORM 1.2, SCORM 2004 3rd Edition only** (NOT 4th Edition), plus **xAPI/Tin Can 1.0.1** and **AICC**.

### Suspend data limits — the central Rise issue

| Standard | Suspend data limit |
|---|---|
| SCORM 1.2 | 4,096 chars |
| SCORM 2004 3rd Edition | 64,000 chars |
| xAPI | No equivalent (LRS-stored) |

Rise 360 uses a lot of suspend data even with compression. Community testing shows roughly 315 chars after a course start, 527 after one page; about 6 to 7 pages of scrolling pushes suspend data past the SCORM 1.2 limit. Rise also always resumes — there is no way to disable resume behavior.

### Tracking fidelity ranking
1. **xAPI** — richest data, but Docebo's reporting UI surfaces it poorly; usually requires API extraction or external LRS
2. **SCORM 2004 3rd Edition** — separate completion versus success status, larger suspend_data, more reliable for longer Rise courses (community-recommended default)
3. **SCORM 1.2** — most universally compatible but suspend_data ceiling causes Rise progress loss on longer courses

### Docebo-specific quirks
- **Max SCORM zip: 1024 MB (1 GB).** Recommended max 15,000 files per package. `imsmanifest.xml` must be at zip root. Filenames cannot contain special characters.
- **HTTPS only.** Mixed content fails silently with no Docebo error UI.
- **Blocked file extensions:** `.htaccess, .php*, .cgi, .sh, .shtml, .asp, .aspx, .jsp, .py, .rb, .pl`. No HTML or JS sanitization beyond this — JS executes as-is.
- Docebo serves SCORM from `*.dcbstatic.com` CDN while LMS host is `*.docebosaas.com`. **Whitelist required:** `cdn1-cdn5.dcbstatic.com`, `*.docebosaas.com`. CSP for embedded learning needs `script-src`, `style-src`, `img-src`, `frame-src`, `child-src` to include `*.dcbstatic.com`, `*.dcbstatic.net`, `*.docebosaas.com`.
- **Safari "Prevent Cross-Site Tracking"** breaks SCORM completion writes — community-confirmed pattern; mobile app explicitly does not support content requiring this disabled.
- **YouTube blocks playback in nested iframes.** Docebo docs explicitly recommend "New Window" view mode if SCORM contains YouTube.

### Mobile app (Go.Learn) limitations
- SCORM packages must be **fully self-contained** to work offline
- **Multi-SCO and multi-chapter SCORM not supported in offline mode**
- **xAPI/TinCan NOT supported offline** at all
- Surveys, tests, LTI, AICC also not supported offline
- 60-second timeout when downloading entire course
- Autoplay full-screen video not supported on mobile app
- BLOBs in xAPI/SCORM/LTI cannot be downloaded offline
- The FINISH command must be sent BEFORE actual closure

---

## What breaks between Articulate Review and Docebo

Articulate themselves admit there is no consistency across the different outputs — preview within Storyline, Review 360, and the LMS version may all look different.

Things that work in Review but break in Docebo:
1. External resources (CDN fonts, http:// images, external JS) — Docebo enforces HTTPS
2. YouTube and Vimeo embeds — fail in nested-iframe view modes
3. postMessage to parent — Review's parent is not Docebo's parent
4. Bookmark and resume — Review does not truly test SCORM bookmarking
5. Completion triggers — Review fakes completion; Docebo requires actual `LMSCommit`/`LMSFinish`
6. Cross-site cookies — Review does not depend on third-party cookies; Docebo's player does
7. Quiz interaction reporting — Articulate's "Track using complete course trigger" drops detailed CMI interactions

### Migration gotchas
- **Updating Rise courses breaks resume** — Rise lesson IDs change on duplication and may shift on add or remove of lessons, causing blank screen on resume in Docebo
- "Restrict Navigation" lessons sometimes get skipped in Docebo even when working in Review
- Two navigation menus problem (Rise's internal menu plus Docebo's training-material list)
- Docebo session timeout (default 3 hours, configurable) — only progress before timeout is recorded

---

