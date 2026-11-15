# Dry Run

A household flood-plan rehearsal: find gaps in backup arrangements before an emergency.

**[Try the public prototype](https://stc-mini-hackathon-2026.vercel.app/)** · **[Pitch deck](docs/Dry_Run_Revised.pdf)**

## Quick demo
1. Choose **Try a sample drill**. Fictional plans and reflections are prefilled.
2. Use **Demo shortcut: two apps, one network** to see why WhatsApp and Telegram can share a failure point.
3. Choose **Review all five reflections** to see gaps, arrangements needing checking, and named backups.
4. Choose **Patch communication** or **Patch evacuation**, edit the backup, and start the rehearsal again.
5. Reassess the changed topic. Its old judgment and explanation are cleared. Unchanged reflections remain available. Review the before-and-after result and water level.

## What it does
Five topics cover warnings, evacuation, people needing assistance, communication, and essential supplies. Users name a first choice and optional backup, consider a disruption, then record whether the backup could work and why. They can patch and replay or print their notes.

Each result has its own animated water column: high for **Gap found**, medium for **Needs checking**, and low for **Backup named**. These illustrate recorded outcomes, not flood depth, measured preparedness, or verified safety. Reduced-motion preferences are respected.

## Entry modes and privacy
- **Write your flood plan** starts blank; **Continue saved plan** restores personal answers from this browser.
- **Try a sample drill** and **Switch to sample plan** open an isolated sample. Sample edits never overwrite the personal plan.
- Personal answers are stored locally by topic ID. Editing a first choice or backup invalidates its previous reflection.
- The app has no backend, accounts, or AI processing at runtime.

## Run and test
Open `index.html` in a browser. Open `tests.html` for 20 outcome and persistence tests. No install or build step is required.

Built with plain HTML, CSS and JavaScript; versioned in GitHub and hosted on Vercel. An HTTPS service worker caches static files for offline use. After a deployment, an already-open tab may need a refresh to use the updated app.

## How outcomes work
Missing first choices, missing or identical backups, and self-reported failure produce **Gap found**. A distinct backup with uncertainty or an incomplete reflection produces **Needs checking**. A distinct backup with an explained yes produces **Backup named**, which remains self-reported and unverified. The app does not evaluate the meaning or safety of free-text answers.

## Credits
The prototype was developed with **Claude and OpenAI Codex**, which generated and revised the code. The creator directed the concept, tested the experience, and provided design and behavior feedback. AI assistance was used during development, not to assess users at runtime.

Preparation wording is an educational synthesis informed by official Malaysian guidance:
- [MKN flood preparation](https://www.mkn.gov.my/web/ms/2026/11/04/persediaan-kecemasan-banjir/)
- [MKN / KKM additional support needs](https://www.mkn.gov.my/web/ms/2025/11/30/persiapan-sebelum-banjir-bagi-golongan-berisiko-tinggi/)

The app links to JPS Public InfoBanjir, METMalaysia, NADMA and JKM. These are external sources, not live integrations or endorsements.

## Scope
This is a rehearsal and discussion tool, not a complete emergency plan, live warning system, or safety certification. Follow current official instructions and confirm routes, destinations and support arrangements. Never enter floodwater to retrieve supplies.

The numbered PNG screenshots in the repository document an earlier business-drill prototype and do not represent the current interface; use the live app for the latest version.
