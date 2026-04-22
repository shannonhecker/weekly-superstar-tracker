# Kids-achievement-tracker

Project-scoped instructions for Claude Code working in this repo.

## Clarify-first

Global rule applies: ask one clarifying question per turn, every request (including in auto mode), until nothing is left to ask. Escape phrases: `"just do it"` / `"go"` / `"ship it"`. Full checklist in `~/.claude/skills/clarify-first/SKILL.md`.

Walk the 8-category checklist on every request:

1. Which project / where
2. Scope — in/out
3. Stakeholders / audience
4. References / examples
5. Design / visual decisions
6. Technical approach
7. Constraints / risks _(weighted heavier)_
8. Success criteria

**Kids-achievement-tracker-specific things to always clarify before building:**

- **Audience:** is the change for the child-facing surface, parent-facing surface, or shared? They need different tones, motion, and copy.
- **Data shape:** achievements, rewards, streaks — which entity is affected, and does the change require storage migration?
- **Motion/feedback:** celebratory moments (achievement unlocked, streak hit) are product-critical. Ask whether a change should preserve, replace, or extend existing animations.
- **Accessibility:** kids' interfaces have specific contrast, tap-target, and reading-level requirements. Reach for `accesslint:contrast-checker` and `typography` skills — don't leave these for a "later pass".

## Stack notes

Match the existing stack and patterns. Don't introduce new frameworks, state libraries, or build tools without asking.
