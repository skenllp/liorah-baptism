# Liorah Bibin — Holy Baptism Invitation

Pure HTML / CSS / vanilla JS. No build step, no frameworks.

## Run locally
```bash
cd liorah-baptism
python3 -m http.server 8000      # or: npx serve
```
Open http://localhost:8000 (on your phone: http://<your-computer-IP>:8000 on the same Wi‑Fi).
Use a local server rather than double-clicking index.html so video/audio load reliably.

## Folder structure
```
index.html              page markup (static text = fallback copy)
css/style.css           all styling; colours/spacing/fonts are variables in :root
js/config.js            ★ EDIT HERE: names, date, times, venues, map links, photo list, music
js/main.js              behaviour (intro, dove, gallery, lightbox, calendar, music)
assets/
  images/  background-01.webp, background-02.webp (+ -sm), opening-poster/last.webp, og-image.jpg
           liorah-photo-01..04.webp   ← ADD YOUR 4 PHOTOS HERE
  video/   opening.mp4 (curtains), (dove is now assets/images/dove-fly.webp)
  audio/   instrumental.mp3           ← ADD YOUR MUSIC FILE HERE
  fonts/   self-hosted Cormorant Garamond + Pinyon Script
```

## Still to do
1. **Map links** → paste Google Maps share links into `ceremony.mapUrl` and `reception.mapUrl` in `js/config.js`. If empty, the buttons open a Google Maps *search* for the venue name.
2. **WhatsApp preview** → set to https://liorah-baptism-flame.vercel.app (change in `index.html` if the domain changes). WhatsApp caches previews; to refresh, share with `?v=2` on the end.

Photos (`liorah-photo-01..04.webp`) and the song (`instrumental.mp3`) are already in place. Hero = photo 1, closing = photo 2 (`heroPhotoIndex` / `closingPhotoIndex`); `focusX/focusY` keep the face centred in the round/arch frames.

## Notes
- Opening: first video frame + highlighted name + **Open Invitation**. The tap plays the curtain video and starts the song (music is never forced; the 🎵 button remembers on/off). When the video ends it fades straight into the invitation; **Skip intro** jumps ahead.
- The dove is your animated WebP (real wing beats, transparent) (assets/images/dove-fly.webp) gliding across the hero with a gentle bob/flap; hidden when "reduce motion" is on.
- Photo tips: export WebP ~1600px on the long side, quality ~80. Originals keep their proportions in the gallery.
- Calendar button downloads an .ics with both the baptism (4:30 PM) and reception (6:00 PM, assumed 3 h — edit `durationMin`), Asia/Kolkata time.
