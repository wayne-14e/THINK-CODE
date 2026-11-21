# THINK//CODE Design Direction

**Product:** A focused coding-practice hub built around independent thinking and real peers  
**Audience:** Beginners and early-career developers  
**Platform priority:** Desktop first; preserve existing responsive behavior, with deeper mobile work later

## 1. Design spirit

THINK//CODE should feel like a capable, welcoming space to practice alongside other people: **pixel, byte, a little glitch, a flash of energy, and warmth**. The visual language can borrow from compact technical tools and polished sci-fi interfaces, but it should not imitate a school, a course-center dashboard, a hacker movie, or an AI command deck.

The feeling is **solo work, with peers close by**. Keep the task clear and the interface calm; let the personality appear in a few well-chosen symbols, accents, and moments of motion.

### Keep

- The dark charcoal foundation and distinctive lime identity.
- Cyan and amber as restrained secondary accents with clear meanings.
- A compact engineering feel, readable content, and clean panel boundaries.
- Human community and mentor presence without turning the LMS into a social feed.
- The THINK//CODE name and “Think. Code. Repeat.” where brand context calls for it.

### Avoid

- A school or formal academic atmosphere, even when presenting structured lessons.
- Matrix-style code rain, fake terminal output, fake system status, or a full-screen “hacker” aesthetic.
- A JARVIS-like holographic HUD, dense sci-fi overlays, or decorative data that looks functional.
- Treating every control as neon, adding gradients to buttons, or using gradient headline text.
- Hostile or absolute anti-AI messaging. The product encourages thinking and human-in-the-loop learning; it does not reject all AI use.
- Oversized all-caps labels, wide letter spacing, noisy glitch effects, or decorative code that competes with real code.

## 2. Color and surface language

Keep the current dark-only semantic palette unless the product owner approves a change:

| Token | Current value | Use |
|---|---|---|
| `--surface-deep` | `#121113` | Main canvas and editor |
| `--surface-raised` | `#1A191C` | Cards and panels |
| `--surface-overlay` | `#242327` | Selected and hover surfaces |
| `--surface-border` | `#424242` | Quiet dividers and boundaries |
| `--text-primary` | `#FFFFFF` | Main text |
| `--text-secondary` | `#B8B8BC` | Supporting text |
| `--text-tertiary` | `#8A898F` | Secondary metadata |
| `--brand-primary` | `#9EFF00` | Brand and primary action |
| `--accent-cyan` | `#03EDFA` | Links, focus, and information |
| `--accent-amber` | `#F8A502` | Caution and selected emphasis |
| `--status-error` | `#FF5C5C` | Errors and destructive states |

- Use the existing CSS variables rather than introducing component-specific hex values.
- Give each accent a clear role in a view. Pair status colors with text or an icon; do not rely on color alone.
- Prefer solid-color buttons and legible surfaces. No gradient buttons or gradient text. Remove the gradient treatment from the landing headline; if a background glow remains, keep it subtle and non-interactive.
- Use borders and spacing before shadows. Reserve stronger elevation for overlays and dialogs.
- Keep static metadata quiet and usually inline rather than decorating every date, count, or category as a capsule. Member tags may use a compact treatment when needed.

## 3. Typography and copy

The current code uses **Inter** for interface/body text and **JetBrains Mono** for code and the display/technical font token. Keep to those existing families; do not reintroduce the old three-font “2+1” specification without approval.

- Use comfortable, readable body text and clear hierarchy.
- Keep title letter spacing compact or slightly tight. Avoid widely tracked headings and decorative all-caps.
- Use monospace for code, concise technical labels, and tabular metrics—not for long reading passages.
- Format numbers consistently where they are compared in columns.
- Write in a friendly, technically confident voice: direct, warm, and peer-to-peer rather than institutional or preachy.
- The product is intended to support English and Russian. Current UI copy is English; do not imply localization is already available.
- Describe the AI position positively: independent reasoning, useful hints, human mentorship, and eventually a guided tutor. Avoid “AI is bad” claims or language that shames learners.

## 4. Symbols, icons, and artwork

Use simple Lucide icons or small text/code symbols to bring in the pixel-and-byte character. Examples include `</>`, `{}`, `$_`, `//`, and `0x`. Use these as brief visual accents—not as fake terminal content or substitutes for labels.

**Illustrations are limited to the public landing page and a workshop card.** The owner plans to provide replacement artwork for those locations. Do not create or add new illustrations. For other screens—including Overview and Syllabus—remove illustration use and prefer a simple icon, typographic symbol, or clean space.

Keep existing artwork in the allowed locations only until owner-provided replacements are available. The brand logo is not treated as an illustration.

## 5. Layout and interaction

- Prioritize desktop learning and coding workflows. Keep the current responsive layouts functional, but do not spend scope on a mobile redesign unless requested.
- Keep navigation familiar and make the active area easy to identify. Use the existing shell rather than inventing a new navigation metaphor.
- Give each screen a clear primary action. Keep problem statements, examples, trace prompts, editorials, and execution outcomes easy to scan.
- Keep the coding workspace focused on the problem, editor, and test feedback. Preserve useful language and draft state where the existing implementation supports it.
- Keep workshops event-centered: date/time, topic, agenda, join action, and past-session materials should be easy to find.
- Keep per-problem mentor Q&A focused on a specific problem. It is not a general in-app chat or social feed; make Telegram and Discord community links easy to find.
- Use small, purposeful transitions. Glitch or flash motion should be rare and brief, never required to understand an action.
- Do not add custom keyboard shortcuts unless requested. Preserve normal keyboard operation and visible focus for standard controls.

## 6. Component guidance

- **Primary actions:** solid lime fill, dark readable label, restrained hover/focus state.
- **Secondary actions:** neutral bordered surface; do not compete with the primary action.
- **Cards and panels:** charcoal surfaces, quiet border, consistent spacing, restrained corner radius.
- **Status:** concise label plus an icon where useful; keep success, warning, and error meanings consistent.
- **Progress and rankings:** clear numbers and simple bars/rings; avoid turning every metric into a badge or decorative widget.
- **Member identity:** use one platform username as the primary identity. Stack, tags, XP, badges, and learning stats support it; avoid presenting multiple external handles as competing names.
- **Feedback and voting:** use plain language and explain what the action does. A dislike on an upcoming workshop topic requires the member to enter a suggested topic.

## 7. Practical quality bar

- A new decorative detail must improve recognition, feedback, or orientation; otherwise omit it.
- Keep text readable against the dark surfaces and make interactive states distinguishable without color alone.
- Prefer native, understandable controls over custom interaction patterns.
- Do not invent imagery, external links, workshop data, or brand copy. Ask the owner or use an explicit placeholder when required source material is missing.
- When a requested screen or feature needs a visual decision that these rules do not settle, ask before establishing a new reusable pattern.
