# Dry Run

**Find the failure before the disaster does.**

A drill for a small disaster plan. A kedai owner, household, or community
committee writes down their plan in five answers. Dry Run then attacks it one
failure card at a time, shows where it breaks, and lets them patch it and run
the drill again.

Built for the STC Mini Hackathon 2026 (theme: Disaster Recovery).

## How it works

1. **Plan.** Five questions, each with a primary and an optional backup.
2. **Drill.** Five cards, shuffled, one per answer. Each card knocks out the
   primary you typed. You bet HOLDS or BREAKS before the card flips.
3. **Results.** Where it broke, what held, how many bets you called, and a
   concentration warning if one answer carries three or more parts of the plan.
4. **Patch and replay.** Add a backup, run again, and compare before and after.
5. **Print my plan.** One page for the fridge or the shop wall, so the plan
   does not live only on a phone that may be dead when it matters.

## Scoring rule

- No backup: BREAKS
- Backup the same as the primary: BREAKS
- Backup different from the primary: HOLDS

Answers are compared after trimming spaces and ignoring letter case. The meter
labels are game feedback, not a risk rating.

## Run it

No install and no build step. Double-click `index.html`.

To run the tests, double-click `tests.html`.

Everything runs in the browser. The plan is saved in `localStorage` on your own
device and the app makes no network calls.

## Files

| File | What it holds |
|---|---|
| `index.html`, `style.css` | Page and styling |
| `scoring.js` | Scoring rule and concentration warning (pure functions) |
| `cards.js` | The five questions and their failure cards |
| `app.js` | Screens, state, storage |
| `tests.html`, `tests.js` | Scoring tests |
| `.kiro/steering/` | Product and tech steering for Kiro |

## Built with

The initial build was written by Claude (Anthropic) from the product spec in
`.kiro/steering/product.md`. The steering files are set up for Kiro.
