# Dry Run
Find the failure before the disaster does.

## What it is
A drill for a small disaster plan. A kedai owner, household, or
community committee enters their plan, the app attacks it one failure
at a time, shows where it breaks, and lets them fix it and run again.

## The plan: 5 questions
Each answer has a PRIMARY and an optional BACKUP (free text).
1. Who holds the keys / access?
2. Where are the important documents kept?
3. Where are the emergency contacts stored?
4. Who knows the suppliers, customers, and money owed?
5. How does everyone reach each other?

## The deck: 5 cards, one per question
Each card inserts the player's own PRIMARY answer into its text.
1. "{primary} is stuck outside the area and cannot get back."
2. "{primary} has been destroyed."
3. "{primary} is lost or dead."
4. "{primary} cannot be reached for a week."
5. "{primary} is down for everyone."

## Scoring rule (exact, do not extend)
Compare answers after trimming spaces and ignoring letter case.
- No backup = BREAKS
- Backup same as primary = BREAKS
- Backup different from primary = HOLDS

## Concentration warning
If the same answer is the PRIMARY for 3 or more questions, show at the
top of the results: "You rely on {answer} for {n} parts of your plan.
Check whether your backups are truly independent."
This is a warning only and does not change scoring.

## Game layer
- Cards are dealt one at a time in shuffled order.
- Before each reveal the player bets HOLDS or BREAKS. Track correct bets.
- Resilience meter: water rises one step per BREAK, 5 steps total.
  0 breaks: "Holding strong" (green). 1-2: "Vulnerabilities found"
  (yellow). 3+: "Critical weaknesses" (red).
  These labels are game feedback, not a risk rating. Say so on screen.
- Results: breaks listed, concentration warning if triggered, and
  "You called X of 5 correctly".
- Patch and replay: player edits backups, deck reshuffles, drill runs
  again. Show the previous meter level next to the new one.
- A "Fill example" button loads a sample kedai plan for demos.
- "Print my plan" on the results screen prints a one-page paper copy
  (question, first choice, backup; a blank line to fill by hand where
  there is no backup). The plan must not live only on the phone.

## Look and feel
A colourful browser card game, not a form and not a dashboard.
- Dark navy background. One large card centred on screen.
- Card flips with a CSS animation to reveal HOLDS (green) or
  BREAKS (red).
- The water is a blue layer that rises from the bottom of the whole
  screen behind the card, with a smooth CSS transition.
- Big rounded buttons, bold type, one emoji per card as its icon.
- CSS animations only. No images, no sprites, no canvas, no
  characters, no sound.

## Rules
- No backend. No login. No live AI calls at runtime.
- All data in localStorage.
- No network calls after first load. All logic runs in the browser.
- When deployed over https, a refresh works offline (service worker
  caches the static files). No install prompt.
- Scoring is a pure function in scoring.js, tested in tests.html.
- Mobile-first, large text, plain language.

## NOT building
- Maps, weather or flood alerts, SOS, donations, chatbots
- Accounts, sharing, multi-user
- Points, badges, leaderboards, characters, sound
- Any scoring logic beyond the rule above
