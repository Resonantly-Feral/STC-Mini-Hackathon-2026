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
- Official sources: the results screen and the printed sheet list four
  official Malaysian sources (Public InfoBanjir, METMalaysia, NADMA
  Portal Bencana, JKM InfoBencana) as plain links, each labelled with
  the agency that runs it, plus "In an emergency, call 999". The app
  never fetches from them and never shows warnings, flood levels or
  shelter status itself, and says so next to the links.

## Look and feel
A colourful browser card game dressed as an emergency operations
command centre. Not a form and not a dashboard of real data.
- Deep navy and charcoal background with a faint grid and glow.
  Glass panels with glowing borders.
- Colour roles: cyan = interactive, amber = warnings and incoming
  events, red = failures, green = a backup taking over.
- Home screen: DRY RUN title, tagline, a five-segment resilience ring
  (empty until the first drill, then the last drill's result), and a
  START SIMULATION button.
- Plan entry is a checklist: numbered cards, a progress strip, and
  visually distinct primary and backup fields. The progress strip only
  shows what is filled in. It never scores before the drill.
- One large event card centred on screen. It arrives with an alert
  animation and flips with CSS to HOLDS (green) or BREAKS (red). The
  back shows the primary knocked out and what takes over, if anything.
- The water is a blue layer that rises from the bottom of the whole
  screen behind the card, with a smooth CSS transition. A five-cell
  bar shows the same level.
- Results are a dashboard: failures, correct bets, meter, warnings,
  what broke, what held. After a replay, the before-and-after panel
  with two animated gauges is the centrepiece.
- Big buttons, bold type, one emoji per card as its icon.
- CSS animations only, switched off under prefers-reduced-motion.
  No images, no sprites, no canvas, no characters, no sound.
- Every number on screen comes from the player's own plan and drill.
  No invented statistics and no safety claims.

## Rules
- No backend. No login. No live AI calls at runtime.
- All data in localStorage.
- No network calls after first load. All logic runs in the browser.
- When deployed over https, a refresh works offline (service worker
  caches the static files). No install prompt.
- Scoring is a pure function in scoring.js, tested in tests.html.
- Mobile-first, large text, plain language.

## NOT building
- Maps, weather or flood alerts, SOS, donations, chatbots. No live
  data of any kind: official sources are links only.
- Accounts, sharing, multi-user
- Points, badges, leaderboards, characters, sound
- Any scoring logic beyond the rule above
