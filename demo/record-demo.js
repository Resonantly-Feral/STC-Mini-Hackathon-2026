/* Records the Dry Run demo video. Needs Playwright (Chromium) and ffmpeg.
   Usage: node demo/record-demo.js [url]
   Default url: the live site. Output: demo/dry-run-demo.mp4 and demo/dry-run-demo.srt
   It only drives the app like a user would; it does not change the app. */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = process.argv[2] || 'https://stc-mini-hackathon-2026.vercel.app/';
const OUT = __dirname;
const RAW = path.join(OUT, 'raw');
const W = 1440, H = 810;   // browser size; the video is scaled up to 1920x1080
const cues = [];
let t0 = 0, openCue = null;

const wait = ms => new Promise(r => setTimeout(r, ms));
const now = () => (Date.now() - t0) / 1000;

(async () => {
  fs.mkdirSync(RAW, { recursive: true });
  const launchOpts = process.env.HTTPS_PROXY && URL.startsWith('http') ? { proxy: { server: process.env.HTTPS_PROXY } } : {};
  const browser = await chromium.launch(launchOpts);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: RAW, size: { width: 1920, height: 1080 } } });
  const page = await ctx.newPage();
  t0 = Date.now();
  await page.goto(URL);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();

  /* Overlays live only in this recording session. */
  await page.addStyleTag({ content: `

    #rec-cap { position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%); z-index: 99999;
      max-width: 1180px; padding: 14px 28px; border-radius: 18px; text-align: center;
      font: 600 28px/1.35 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #fff;
      background: rgba(4, 9, 22, .9); border: 2px solid rgba(34, 225, 255, .6);
      box-shadow: 0 12px 40px rgba(0,0,0,.5); opacity: 0; transition: opacity .35s; pointer-events: none; }
    #rec-cap.on { opacity: 1; }
    #rec-title { position: fixed; inset: 0; z-index: 100000; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center; gap: 18px;
      background: radial-gradient(900px 500px at 50% 35%, rgba(34,225,255,.22), transparent 70%), #050a17;
      color: #eaf2ff; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      opacity: 0; transition: opacity .6s; pointer-events: none; }
    #rec-title.on { opacity: 1; }
    #rec-title .eyebrow { font: 700 20px ui-monospace, Menlo, Consolas, monospace; letter-spacing: 6px; color: #22e1ff; }
    #rec-title h1 { margin: 0; font-size: 150px; line-height: .95; font-weight: 900; letter-spacing: 4px;
      background: linear-gradient(180deg, #fff 10%, #9defff 55%, #22e1ff); -webkit-background-clip: text; color: transparent; }
    #rec-title .sub { font-size: 36px; font-weight: 600; }
    #rec-title .small { font-size: 24px; color: #a3b5d6; max-width: 1000px; }
    #rec-title .url { font: 700 28px ui-monospace, Menlo, Consolas, monospace; color: #22e1ff; margin-top: 10px; }
  `});
  await page.evaluate(() => {
    const c = document.createElement('div'); c.id = 'rec-cap'; document.body.appendChild(c);
    const t = document.createElement('div'); t.id = 'rec-title'; document.body.appendChild(t);
  });

  async function title(lines, ms) {
    await page.evaluate(lines => {
      const t = document.getElementById('rec-title'); t.textContent = '';
      lines.forEach(([cls, text]) => { const d = document.createElement(cls === 'h1' ? 'h1' : 'div'); if (cls !== 'h1') d.className = cls; d.textContent = text; t.appendChild(d); });
      t.classList.add('on');
    }, lines);
    const start = now();
    await wait(ms);
    cues.push([start, now(), lines.map(l => l[1]).join(' · ')]);
    await page.evaluate(() => document.getElementById('rec-title').classList.remove('on'));
    await wait(700);
  }
  async function cap(text) {
    if (openCue) { openCue[1] = now(); cues.push(openCue); openCue = null; }
    if (!text) { await page.evaluate(() => document.getElementById('rec-cap').classList.remove('on')); return; }
    await page.evaluate(text => { const c = document.getElementById('rec-cap'); c.textContent = text; c.classList.add('on'); }, text);
    openCue = [now(), 0, text];
  }
  const scrollTo = async (sel, block) => { await page.evaluate(([s, b]) => { const e = document.querySelector(s); if (e) e.scrollIntoView({ behavior: 'smooth', block: b || 'center' }); }, [sel, block]); await wait(900); };
  const scrollTop = async () => { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await wait(700); };

  const trimAt = now();
  const byText = async (sel, text) => page.evaluate(([s, t]) => { const e = [...document.querySelectorAll(s)].find(n => n.textContent.trim() === t);
    if (e) { e.setAttribute('data-rec', t); return true; } return false; }, [sel, text]);
  await title([['eyebrow', 'STC MINI HACKATHON 2026 · DISASTER RECOVERY'], ['h1', 'DRY RUN'], ['sub', 'Find gaps in your flood plan before you need it.'],
    ['small', 'A short flood-plan rehearsal for a household, a kedai or a community.']], 5000);

  // Home
  await cap('Five topics: warnings, evacuation, people, communication and essentials.');
  await wait(4500);
  await cap('For this demo, a fictional sample plan. Your own plan stays separate.');
  await wait(3000);
  await page.click('#demo'); await wait(1000);

  // Rehearsal with the sample
  await cap('Each card is a disruption. Would your backup still work? Choose, then explain why.');
  await scrollTo('#warnings-scenario'); await wait(4200);
  await cap('No backup for transport: the plan has a gap, and the water rises.');
  await scrollTo('#evacuation-scenario'); await wait(4000);
  await cap('Now the shared failure.');
  await scrollTo('.demo-shortcut'); await wait(1500);
  await page.click('.demo-shortcut'); await wait(1400);
  await cap('First choice WhatsApp, backup Telegram. Two apps, one mobile network.');
  await wait(5000);
  await cap('If the network goes down, both go down. That is not really a backup.');
  await wait(4500);
  await scrollTo('#review'); await wait(800);
  await page.click('#review'); await wait(1200);

  // Review
  await cap('The review: gaps found, things to check, and backups named.');
  await wait(4500);
  await scrollTo('[aria-label="Evacuation result"]');
  await cap('Every topic gets its own water level and plain-language next step.');
  await wait(4000);
  await scrollTo('[aria-label="Communication result"]');
  await cap('Communication: gap found. Patch it.');
  await wait(3200);
  await page.click('[aria-label="Communication result"] button'); await wait(1200);

  // Patch
  await scrollTo('#communication-backup');
  await cap('Patch: a fallback that does not need the phone network at all.');
  await page.fill('#communication-backup', '');
  await page.click('#communication-backup');
  await page.keyboard.type('Meet at the surau gate at 6 pm if phones are down', { delay: 70 });
  await wait(1500);
  await cap('Then rehearse again.');
  await scrollTo('#start'); await wait(1200);
  await page.click('#start'); await wait(1200);

  // Reassess
  await scrollTo('#communication-scenario');
  await cap('The changed answer is flagged: reassess this scenario.');
  await wait(3800);
  await page.click('input[name="assessment-communication"][value="yes"]'); await wait(700);
  await page.click('#communication-reflection');
  await page.keyboard.type('The meeting point needs no network. Everyone has agreed the time.', { delay: 55 });
  await wait(1200);
  await scrollTo('#review'); await wait(800);
  await page.click('#review'); await wait(1200);

  // Before and after
  await cap('Reassessed.');
  await wait(2000);
  await byText('h2', 'Before and after');
  await scrollTo('[data-rec="Before and after"]', 'start');
  await cap('Before and after: Communication went from gap found to backup named.');
  await wait(5500);
  await cap('The other gaps stay visible. It is a rehearsal, not a safety rating.');
  await wait(4200);
  await scrollTo('.sources');
  await cap('For real warnings and shelters: official Malaysian sources, linked, never copied.');
  await wait(4500);
  await scrollTo('#print');
  await cap('Print it for the fridge. It works offline, with no login, on any phone.');
  await wait(4000);
  await cap(null);

  await title([['h1', 'DRY RUN'], ['sub', 'A warning tells you danger is coming.'], ['sub', 'Dry Run shows which part of your plan fails when it arrives.'],
    ['url', 'stc-mini-hackathon-2026.vercel.app']], 6000);
  const endAt = now();

  const video = page.video();
  await ctx.close(); await browser.close();
  const raw = await video.path();

  const fmt = s => { s = Math.max(0, s - trimAt); const ms = Math.round((s % 1) * 1000); s = Math.floor(s);
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, '0')).join(':') + ',' + String(ms).padStart(3, '0'); };
  const srt = cues.sort((a, b) => a[0] - b[0]).map((c, i) => (i + 1) + '\n' + fmt(c[0]) + ' --> ' + fmt(c[1]) + '\n' + c[2] + '\n').join('\n');
  const srtPath = path.join(OUT, 'dry-run-demo.srt');
  fs.writeFileSync(srtPath, srt);

  const mp4 = path.join(OUT, 'dry-run-demo.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', trimAt.toFixed(2), '-i', raw, '-i', srtPath,
    '-t', (endAt - trimAt + 0.3).toFixed(2), '-map', '0:v', '-map', '1:s',
    '-vf', 'scale=1920:1080,fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-c:s', 'mov_text', '-metadata:s:s:0', 'language=eng', '-movflags', '+faststart', mp4]);
  fs.rmSync(RAW, { recursive: true, force: true });
  console.log('wrote', mp4, 'length', (endAt - trimAt).toFixed(1) + 's');
})().catch(e => { console.error('FAILED', e); process.exit(1); });
