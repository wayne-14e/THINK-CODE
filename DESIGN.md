# THINK//CODE Design System

**Status:** v2.3 Beta Specification (Visual-First Apple Minimal Copy & Dark-Only Workstation)
**Source of truth:** [THINK//CODE MEDIA Figma draft](https://www.figma.com/design/BejMGajwVwbu0IEViv16Ih/THINK--CODE-MEDIA?node-id=0-1&p=f&t=T1fNyLcYY2NMhg42-0)
**Platform:** Desktop-first Next.js web application, with a mobile-responsive reading and challenge experience
**Product:** Serious coding academy for algorithmic thinking, competitive programming, workshops, and human mentorship

---

## 1. Design Direction

### 1.1 Product Thesis

THINK//CODE should feel like a focused engineering workstation, not a game or a social-media feed. The interface combines the visual character of a terminal with the calm usability of a modern Apple desktop application.

**The central design idea:** *A precise, human, slightly rebellious terminal for serious learning.*

The draft establishes this idea through:

- Deep charcoal surfaces
- Restrained acid-lime identity and positive status color
- Monospaced utility copy and tabular figures
- Subtle terminal structural cues without pseudo-code noise (`// 01` header spam is prohibited)
- Bright cyan, amber, and red used strictly with semantic text and icons

### 1.2 Apple Aesthetic Translation

The existing visual personality should be preserved, but the application chrome should stop resembling a graphic mockup and begin behaving like dependable software.

Apply these principles:

- **Identity in the content layer:** lime and terminal motifs belong in headers, data, progress, and the single brand wordmark. They should not replace standard states or overwhelm every control.
- **Familiar controls:** navigation, buttons, inputs, tabs, dialogs, menus, and focus states remain immediately recognizable. Brand treatment changes finish and emphasis, not placement or behavior.
- **Calm hierarchy:** most screens follow the 60-30-10 color budget—60% neutral canvas, 30% single-elevation hairline surfaces, and 10% purposeful accent.
- **Zero-pill static metadata:** never wrap tags, dates, counts, or categories in rounded pill capsules; render static metadata as clean unboxed inline text separated by `·` or `/`.
- **Visual-first, minimum wording:** communicate through bespoke transparent-background illustrations, progress rings, proportional difficulty/track bars, podium visualizations, and interactive trace widgets instead of explanatory paragraphs across the Landing page and LMS chrome. **Exception:** Coding problem statements, constraints, I/O examples, Think-Before-You-Run checks, and official editorials inside the Sandbox must remain thorough and crystal clear.
- **Craft over decoration:** motion, syntax colors, grid lines, and status labels are meaningful and restrained (`<= 200ms`).
- **Progressive disclosure:** show the primary task first; place explanations, discussions, editor settings, and auxiliary controls behind clear affordances.

The benchmark is the Apple HIG principle: *Simplicity is a focused experience with every necessary element earning its place.*

Relevant guidance:

- Layout: prioritize content, align deliberately, and adapt layouts to available space.
- Typography: establish hierarchy with a small number of typefaces and preserve it as text scales.
- Color: use one color consistently for one meaning, preserve sufficient contrast across states, and never communicate by color alone.
- Branding: accent color belongs in primary actions and status; branding should defer to content.
- Accessibility: support text scaling, 4.5:1 text contrast, non-color indicators, keyboard use, and sufficiently sized controls.

---

## 2. Visual Foundation

### 2.1 Color Palette

Use semantic CSS variables (`--surface-deep`, `--brand-primary`, etc.) rather than raw hex values in application code.

| Token | Hex (Dark) | Role | Sample contrast |
|---|---:|---|---:|
| `--surface-deep` | `#121113` | Primary app, editor, and terminal surface | Base |
| `--surface-raised` | `#1A191C` | Cards, popovers, elevated panels | 1.08:1 from deep |
| `--surface-overlay` | `#242327` | Hover, selected, modal surfaces | 1.29:1 from deep |
| `--surface-border` | `#424242` | Subtle separators and control boundaries | 8.02:1 vs lime |
| `--text-primary` | `#FFFFFF` | Primary copy and active values | 18.83:1 on deep |
| `--text-secondary` | `#B8B8BC` | Supporting copy | WCAG AA verified |
| `--text-tertiary` | `#8A898F` | Metadata and disabled copy | Context verified |
| `--brand-primary` | `#9EFF00` | Brand, primary emphasis, progress, Accepted state | 15.03:1 on deep |
| `--brand-primary-hover` | `#B6FF3A` | Hover state for brand controls | High contrast |
| `--accent-cyan` | `#03EDFA` | Focus rings, links, running state, info | 13.00:1 on deep |
| `--accent-amber` | `#F8A502` | Caution, Medium difficulty, Time Limit Exceeded | 10.28:1 on deep |
| `--status-success` | `#9EFF00` | Accepted, completed (paired with check icon + text) | 15.03:1 on deep |
| `--status-warning` | `#F8A502` | Time limit concerns and medium severity | 10.28:1 on deep |
| `--status-error` | `#FF5C5C` | Wrong answer, runtime error, destructive | High contrast |
| `--status-info` | `#03EDFA` | Information, running execution | 13.00:1 on deep |

Do not use lime, cyan, or amber for two different meanings in the same view. Status text and an icon must always accompany a status color.

### 2.2 Dark-Only Appearance

The Beta ships **dark-only**. There is no light appearance and no theme toggle: the semantic CSS variable map in section 2.1 is declared once on `:root` alongside `color-scheme: dark`, and Tailwind's `dark:` variant is not used.

- Do not add a second palette or a theme switch without a product decision.
- Never hard-code appearance-specific hex values or brittle `!important` inversion rules into individual components.
- Illustration assets live in `public/images/` and are referenced by absolute path (for example `/images/illustration-hero.png`); do not import images from `src/`.

### 2.3 Typography (2+1 System)

Use a disciplined `2+1` font pairing:

| Role | Typeface | Fallback |
|---|---|---|
| Display & Section Headings | Plus Jakarta Sans | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Product UI & Reading Prose | DM Sans | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Code, Tabular Metrics & Kickers | JetBrains Mono | `ui-monospace, SFMono-Regular, Menlo, Monaco, monospace` |

All numeric columns (XP, streaks, leaderboard ranks, test runtimes) must enforce `tabular-nums` in `JetBrains Mono` to prevent layout jitter. Display headlines use `text-wrap: balance` to prevent single-word orphans.

#### Desktop Type Scale

| Role | Size / line height | Weight | Usage |
|---|---:|---:|---|
| Display | 56/64 px | 700 | Rare hero or workshop moments |
| Title 1 | 40/48 px | 700 | Primary page title |
| Title 2 | 28/36 px | 700 | Section and panel title |
| Headline | 20/28 px | 650 | Card title and important label |
| Body Large | 18/28 px | 400 | Lesson reading |
| Body | 16/24 px | 400 | Standard interface copy |
| Label | 14/20 px | 600 | Buttons and compact headings |
| Metadata | 12/16 px | 500 | Technical labels and timestamps |
| Code | 14/21 px | 400 | Editor body |
| Code Small | 12/18 px | 400 | Line numbers and inline technical tags |

The web baseline should be at least 16 px for body copy and 14 px for utility UI. The draft's 32 px social-media style does not translate to an accessible or dense LMS interface.

### 2.4 Spacing and Layout

- Use an 4 px base grid for fine adjustments and an 8 px grid for layout.
- Standard spacing: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
- Page gutters: 32 px desktop; 20 px tablet; 16 px mobile.
- Reading-column width: 720 px maximum.
- Primary content-column width: 760-960 px.
- Right-side workshop/detail panel: 320-360 px.
- Default card radius: 12 px.
- Control radius: 8 px.
- Keep most surfaces rectangular and sharp; reserve a large radius for sheets or floating overlays only.
- Avoid shadows in the main information hierarchy. A thin border and a low elevation are enough.
- At compact widths, stack panels in reading order rather than hiding critical actions.

### 2.5 Radius, Borders, and Elevation

The draft is mostly rectilinear. Apple-like polish comes from careful subtlety rather than fully rounded cards.

- `border-width: 1px`
- `border-radius: 8px` for controls
- `border-radius: 12px` for cards
- `border-radius: 16px` for sheets and prominent dialogs
- `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16)` only for floating panels
- Separators should use `surface-border`, not a second accent color

### 2.6 Iconography

- Use Lucide icons for interface controls.
- Use one icon weight consistently at 1.5-2 px stroke.
- Keep icon size paired with text: 16 px in compact controls, 20 px in buttons and navigation, 24 px for empty states.
- Brand and mascot moments may use custom vectors, but all utility icons must have text labels or accessible names.
- Never use emoji as interface status when a stable icon or text state is available.
- Preserve a small set of custom terminal glyphs as decoration: `/`, `>`, `$`, `{}`, `[]`, `_`, and `//`.

---

## 3. Layout and Navigation

### 3.1 Desktop Application Shell

```text
+----------------------------------------------------------------+
| Brand / Breadcrumb                    Search       Profile    |
+----------------------+-----------------------------------------+
| Section Navigation   | Page Header                             |
|                      |-----------------------------------------|
| Learn                |                                         |
| Challenges           | Primary content                         |
| Workshops            |                                         |
| Community            |                                         |
|                      |                                         |
+----------------------+-----------------------------------------+
```

- Desktop navigation may use a slim left sidebar.
- On compact widths, convert the sidebar to a top header plus a menu or bottom navigation.
- Keep the current section visibly selected.
- Preserve the user's place when opening problem discussions or workshop details.

### 3.2 Breakpoints

| Name | Width | Layout |
|---|---:|---|
| Mobile | `< 768px` | Single column; editor becomes a tabbed or stacked workspace |
| Tablet | `768-1024px` | Collapsible sidebar; one content pane |
| Desktop | `1024-1440px` | Sidebar plus content or split workspace |
| Wide | `> 1440px` | Maximum 1440 px content width; no uncontrolled stretching |

Use actual container width, not device identity, to choose the split or stacked layout.

### 3.3 Coding Sandbox

The primary workspace is a split view:

```text
+-------------------------------+--------------------------------+
| Problem / Mentor tabs         | Language / Run / Submit        |
|                               |--------------------------------|
| Description                   | Monaco editor                  |
| Examples                      |                                |
| Constraints                   |                                |
+-------------------------------+--------------------------------+
| Status / test result dock                                             |
+----------------------------------------------------------------------+
```

- Problem rail: 38-42% of the workspace.
- Editor rail: 58-62%.
- The split divider is keyboard operable and remembers the user's width.
- On mobile, use tabs for `Problem`, `Editor`, and `Tests`.
- Keep `Run` and `Submit` available with unambiguous names and loading states.
- Status output uses text plus an icon or badge; never status color alone.
- Preserve unsaved code and the user's language choice.

---

## 4. Components

### 4.1 Buttons

| Button | Visual | Usage |
|---|---|---|
| Primary | Lime fill, deep text, 8 px radius | One decisive action per view |
| Secondary | Neutral raised surface, border | Alternative action |
| Tertiary | Text-only with no border | Low-priority navigation or utility |
| Destructive | Red treatment only after intent is confirmed | Delete, reset, irreversible action |

- Minimum desktop target: 32 px.
- Preferred web target: 44 px.
- Minimum mobile target: 44 px.
- Use label text that describes the result: `Submit solution`, `RSVP`, `Run code`, `Save changes`.
- Do not repeat `THINK//CODE` inside every action or card.

### 4.2 Inputs

- Use a clearly labeled field, not placeholder-only identification.
- 44 px height on mobile and touch-first layouts.
- 40 px height on desktop.
- Error copy appears directly below the field and includes how to recover.
- Focus ring: 2 px `--accent-cyan` outline with 2 px offset.
- Preferred controls: native text fields, checkboxes, selects, and radios.
- Terminal aesthetics appear around the content, not as replacement for familiar form affordances.

### 4.3 Cards and Panels

Cards are for independent, comparable units such as problems, workshops, and archived lessons. Do not nest multiple containers without an information reason.

Recommended card structure:

```text
[eyebrow / status]
Title
Description
Metadata row
Primary or contextual action
```

- Use 12 px radius.
- 16 px inner padding for compact cards.
- 24 px inner padding for major cards.
- Border 1 px.
- Hover: subtle surface raise and border increase, never dramatic scaling.

### 4.4 Terminal Labels

Use short terminal labels for orientation, not for every sentence:

- `$ SYSTEM_UPDATE`
- `> CODE_STATUS`
- `INPUT_REQUIRED_`
- `COMPILER:`
- `STATUS:`

Terminal labels should:

- Have one clear purpose
- Remain readable without pseudo-logs
- Avoid punctuation-heavy fake loading sequences
- Never communicate status solely through an animated ellipsis or progress bar

### 4.5 Progress and Status

- Determinate progress uses a visible percentage or completed count.
- Indeterminate loading uses text plus a spinner or subtle line indicator.
- Streaks and XP use `--brand-primary`, but must also show a number.
- Accepted: green plus check and `Accepted`.
- Wrong Answer: red plus X and `Wrong Answer`.
- Time Limit Exceeded: amber plus clock and `Time Limit Exceeded`.
- Loading: cyan plus `Running` or `Submitting`.

### 4.6 Navigation and Tabs

- Top-level sections use a sidebar on desktop and recognizable navigation on compact layouts.
- Tabs belong inside a view or split panel, not at the app level.
- Selected tabs use a 2 px underline or filled secondary surface plus text.
- Use descriptive labels such as `Description`, `Discussion`, and `Editorial`.

### 4.7 Modals and Sheets

- Use a modal only for one short, self-contained task.
- Include an explicit close or cancel action.
- Preserve the user's prior context after dismissal.
- Use 16 px radius for floating sheets.
- Alerts are reserved for consequential outcomes, permissions, or destructive confirmation.

---

## 5. Motion

Motion should communicate state, not decorate the learning task.

### 5.1 Timing

| Usage | Duration | Curve |
|---|---:|---|
| Hover and color | 120-160 ms | `ease-out` |
| Panel and drawer | 180-240 ms | `ease-in-out` |
| View transition | 180-240 ms | `ease-out` |
| Completion confirmation | 240-320 ms | `ease-out` |

Avoid bounce, spring, parallax, and large scale effects in productivity screens.

### 5.2 Rules

- Mark loading immediately, and keep the interface usable while loading.
- Animate a changed status once, not continuously.
- Respect `prefers-reduced-motion`.
- Never animate text as a typewriter effect in core content.
- A looping social/video format may use terminal framing, but the application itself should not loop.
- Do not auto-play audio or video.

---

## 6. Content and Voice

### 6.1 Voice

THINK//CODE is direct, technically informed, encouraging, and lightly humorous.

- Prefer `Think before you run` to `Let's start the challenge`.
- Use specific action names: `Run code`, `Submit solution`, `RSVP to workshop`.
- Keep terminal jokes optional and secondary to the task.
- Never use fake system errors to hide real usability problems.

### 6.2 Technical Copy

- Use sentence case for body copy and interface labels.
- Capitalize language names normally: `Python`, `JavaScript`, `C++`.
- Use `THINK//CODE` for the product name.
- Use status values exactly: `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Runtime Error`.
- Do not overuse capitalization or all-caps copy.

### 6.3 Social and Marketing Copy

The draft contains strong slogans and calls to action:

- `THINK. CODE. REPEAT.`
- `FROM 0 TO SOMETHING`
- `NETWORK. LEARN. BUILD.`
- `COMMUNITY_STATUS: ONLINE`
- `A COMPUTER LEARNED TO SING`

In the product UI:

- Keep such lines as hero or promotional moments.
- Do not put them next to every data point.
- Translate `FUN_MODE` into a real style token or small content moment, not a permanent UI label.

---

## 7. Figma Draft Audit and Frame Inventory

The draft contains social-media canvases, workshop announcements, challenges, historical posts, community moments, and brand assets. The following is a functional classification of every top-level frame found in the draft.

### 7.1 Brand and Community

| Figma ID | Frame | Purpose |
|---|---|---|
| `203:16` | `think//code` | Standalone brand mark |
| `277:2` | `Frame 52` | 1920x1080 community hero; motto and navigation subjects |
| `250:2` | `Frame 48` | Community metrics and `while True: think() / code()` hero |
| `383:33` | `Frame 77` | Compact banner variant of the community motto |
| `361:221` | `Frame` | Compact THINK//CODE wordmark |
| `361:309` | `Frame 73` | Square brand-symbol export |

### 7.2 Python Quiz and Challenge Series

| Figma ID | Frame | Quiz or concept |
|---|---|---|
| `241:2` | `Frame 45` | Quiz 02: list aliasing and append |
| `244:2` | `Frame 46` | Quiz 04: exponent associativity |
| `276:2` | `Frame 51` | Quiz 05: mutation while iterating |
| `288:2` | `Frame 54` | Quiz 06: aliasing and shallow copy |
| `308:2` | `Frame 59` | Quiz 07: repeated list references |
| `322:2` | `Frame 63` | Quiz 08: loop append and break condition |
| `326:2` | `Frame 65` | Challenge-frame slot with no visible copy extracted |
| `355:42` | `Frame 68` | Challenge-frame slot with no visible copy extracted |

These frames establish a repeatable challenge template: issue number, challenge title, large code block, right-side execute control, and a clear answer placeholder.

For the LMS, keep this template but improve output handling:

- Show line numbers outside the code content
- Keep line-height consistent
- Place `Run code` in a control bar
- Show actual output and test status
- Add accepted/wrong-answer, execution time, memory, and retry affordances

### 7.3 Polls and Interactive Prompts

| Figma ID | Frame | Prompt |
|---|---|---|
| `232:2` | `Frame 43` | Language selection |
| `245:2` | `Frame 47` | Favorite coding snack |
| `259:2` | `Frame 49` | Code status / changing things |

Replace image-only poll mockups with real controls:

- Native radio or segmented choices
- Visible progress or result counts after submission
- Disabled state until a choice is made
- Accessible group label and keyboard selection

### 7.4 Workshops and Events

| Figma ID | Frame | Event |
|---|---|---|
| `264:2` | `Frame 50` | First workshop and availability |
| `298:2` | `Frame 56` | Workshop 02 platform status |
| `319:2` | `Frame 62` | Workshop 03 |
| `389:33` | `Frame 79` | Workshop and training at Bukhara State University |
| `392:31` | `Frame 80` | Workshop 06: AI and ML through code |
| `404:39` | `Frame 83` | Workshop 07: algorithmic challenges |
| `407:14` | Workshop 05 loop | AI and ML fundamentals 5-second loop |
| `366:37` | `Frame 75` | Hackathons and Devpost |
| `362:354` | `Frame 74` | Workshop media slot |
| `386:37` | `Frame 78` | Workshop media slot |
| `397:33` | `Frame 81` | Workshop media slot |
| `402:34` | `Frame 82` | Workshop media slot |
| `408:39` | `Frame 84` | Workshop media slot |
| `377:55` | `Frame 76` | Workshop media slot |

For the LMS implementation:

- Upcoming workshop card: topic, date, time, prerequisites, location/link, RSVP
- Time shown in the user's timezone and the academy timezone
- Clear `RSVP`, `Cancel RSVP`, and `Add to calendar`
- Archive links for slide, repository, notebook, recording, and problem set

### 7.5 Opportunities and Resources

| Figma ID | Frame | Topic |
|---|---|---|
| `324:2` | `Frame 64` | Volunteer opportunity |
| `345:2` | `Frame 66` | Pyxel game development |
| `366:37` | `Frame 75` | Devpost hackathons |
| `349:2` | `Frame 67` | Resource slot |
| `418:2` | `Frame 85` | Media or resource slot |

The product can reuse a resource-card pattern with source, type, external-link affordance, and a saved state.

### 7.6 Culture and Editorial

| Figma ID | Frame | Topic |
|---|---|---|
| `214:2` | `Frame 42` | IBM 7094 / Daisy Bell historical post |
| `282:3` | `Frame 53` | Fictional Yoptascript language, humorous and offensive in parts |
| `292:2` | `Frame 55` | Internet Archive / Star Wars ASCII |
| `302:2` | `Frame 57` | Platform online / prototype link |
| `307:21` | `Group 70` | Square visual asset |
| `316:41` | `Frame 60` | Square visual asset |

The Yoptascript copy should not enter the LMS interface unchanged. It is inappropriate for structured learning and may distract from the serious academy direction.

### 7.7 Media Formats

The draft includes 512x521, 1080x1350, 1280x720, 1584x396, 1920x1080, 640x640, 414px, and 234px assets.

For product use:

- 1920x1080: desktop promotion
- 1280x720: standard workshop and social video
- 1080x1350: portrait/social post
- 640x640: square community asset
- 1584x396: compact banner
- Keep 16:9, 4:5, 1:1, and 4:1 exports distinct from reusable UI components

---

## 8. Repeatable Patterns

### 8.1 Community Hero

Use for home or community pages:

```text
Label: SYSTEM_ONLINE
H1: THINK. CODE. REPEAT.
Metrics: 26 MEMBERS, 1 COMMUNITY, INFINITE PROBLEMS
Primary action: Start today's challenge
Secondary action: Explore syllabus
```

Keep `while True` moments to one concise code block.

### 8.2 Workshop Card

```text
WORKSHOP / 06
Title
Date and timezone
Topic and prerequisites
Location or Google Meet
[RSVP] [View details]
```

### 8.3 Quiz Card

```text
QUIZ_02 / PYTHON
Prompt
Code block
Run code
Output
Difficulty and topic
Discussion
```

### 8.4 Historical or Editorial Card

```text
Editorial eyebrow
Title
Illustration or historical media
Short technical summary
Source
Read / Explore
```

---

## 9. Accessibility

### 9.1 Minimum Requirements

- Text: 4.5:1 for normal text, 3:1 for bold or large text.
- Interactive controls: 44 px high on touch layouts; 32 px high on desktop where dense, with 8-12 px spacing.
- Visible keyboard focus on every interactive element.
- Every icon control has an accessible name.
- Status includes text and a recognizable shape or icon.
- No time-boxed interface actions unless the learner is explicitly warned and the timer can be paused or extended.
- Respect browser zoom, font scaling, reduced motion, and increased contrast.
- Preserve a focus target after a modal or panel closes.

### 9.2 Screen Readers

- Use semantic headings and landmarks.
- Label code editor regions and test output.
- Announce submissions only through a polite live region on start/completion.
- Do not announce every progress tick.
- Provide text alternatives for diagrams and screenshots.
- Keep line numbers from being read as code content.

### 9.3 Keyboard

Minimum keyboard behavior:

- Tab navigation through the page and workspace.
- `Enter` and `Space` activate familiar controls.
- `Escape` closes overlays.
- Arrow keys operate segmented controls and menus.
- Monaco retains standard code-editor keyboard behavior and is never trapped.

---

## 10. Responsive Behavior

### Mobile

- The sidebar becomes a compact menu or bottom navigation.
- Challenge description and editor switch with tabs.
- Workshop details stack.
- Metrics wrap into 2 columns, never below 44 px hit targets.
- Social banners remain 16:9 or 4:5 and can crop media safely.
- Terminal titles wrap instead of forcing horizontal overflow.

### Tablet

- A narrow sidebar may collapse.
- Problem and editor panels split only when at least 900 px is available.
- Workshop RSVP stays visible in the detail pane.

### Desktop

- Dense code editor remains the main workspace.
- Panels resize within a fixed content max width.
- No critical information sits under the browser's fixed bottom region.
- Discussions remain in context or in a resizable right panel.

---

## 11. Implementation Notes

### Tailwind Tokens

```ts
export const colors = {
  surface: {
    deep: "#121113",
    raised: "#1A191C",
    overlay: "#242327",
    border: "#424242",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#B8B8BC",
    tertiary: "#8A898F",
  },
  brand: {
    primary: "#9EFF00",
  },
  accent: {
    cyan: "#03EDFA",
    amber: "#F8A502",
    magenta: "#FF00E2",
  },
};
```

Map these values to CSS variables before using them in components. Expose semantic aliases such as `success`, `warning`, `error`, and `info` rather than component-level raw hex values.

### Component Mapping

| UI requirement | Component |
|---|---|
| Page shell | Sidebar, header, content region |
| Challenge tabs | Tabs |
| Problem description | Scrollable reading panel |
| Code editor | Monaco with custom theme |
| Execution status | Badge plus live region |
| Workshop RSVP | Button group plus confirmation |
| Language selection | Segmented control or radio group |
| Community metrics | Static metric cards |
| Discussion | Thread panel or inline accordion |
| Archive resource | Link card |
| Confirmation | Dialog |

---

## 12. What to Preserve

- Deep charcoal terminal surfaces
- Acid-lime primary identity
- Monospaced technical titles
- `$`, `>`, `{}`, `[]`, and `//` decorative language
- The `THINK. CODE. REPEAT.` motto
- Challenge, workshop, and community frame consistency
- Cyan, amber, and magenta as meaningful expressive highlights
- The strong contrast and engineering-first visual energy

## 13. What to Remove or Soften

- Neon-on-every-control treatment
- Full-screen all-caps text in normal interface screens
- Emoji-only status indicators
- Excessive fake loading sequences
- Repeated `THINK//CODE©` in every utility screen
- Decorative line numbers that do not belong to real code
- The Yoptascript and other offensive or distracting editorial copy
- Hard-coded status colors in components
- Social-poster density inside operational product screens

---

## 14. Quality Checklist

- [ ] A single primary action is visually obvious on every screen
- [ ] Brand color appears in no more than a few meaningful places
- [ ] No status relies on color alone
- [ ] Body copy meets its target contrast
- [ ] Navigation remains recognizable and consistent
- [ ] The code editor is usable on narrow layouts
- [ ] Tab and discussion states are keyboard accessible
- [ ] Workshop times include timezone context
- [ ] Loading states appear immediately and determinately where possible
- [ ] Reduced motion and increased contrast are verified
- [ ] The layout survives browser zoom and large text settings
- [ ] Every external URL has a clear link affordance
- [ ] The screen can still be understood if imagery does not load
