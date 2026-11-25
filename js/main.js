/* Liorah Bibin — Holy Baptism invitation. Vanilla JS, no dependencies. */
(function () {
  "use strict";
  var C = window.INVITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- 1. Bind config values into the page ---------- */
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    var v = el.getAttribute("data-bind").split(".").reduce(function (o, k) { return o && o[k]; }, C);
    if (typeof v === "string") el.textContent = v;
  });

  /* ---------- 2. Location + calendar links ---------- */
  function mapLink(v) {
    if (v.mapUrl) return v.mapUrl;
    // No URL configured: fall back to a Google Maps *search* for the venue name (not a fixed pin).
    var q = [v.venue, v.place].filter(Boolean).join(", ");
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }
  $("#ceremonyMap").href = mapLink(C.ceremony);
  $("#receptionMap").href = mapLink(C.reception);

  function pad(n) { return String(n).padStart(2, "0"); }
  function localStamp(dateISO, time24, addMin) {      // floating local time "YYYYMMDDTHHMMSS"
    var p = dateISO.split("-").map(Number), t = time24.split(":").map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2], t[0], t[1] + (addMin || 0)));
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00";
  }
  function place(v) { return [v.venue, v.place].filter(Boolean).join(", "); }
  function esc(s) { return String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n"); }

  function buildICS() {
    var e = C.event, tz = e.timezone, stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    function vevent(uid, title, v, desc) {
      return ["BEGIN:VEVENT", "UID:" + uid + "@liorah-baptism", "DTSTAMP:" + stamp,
        "DTSTART;TZID=" + tz + ":" + localStamp(e.dateISO, v.time24),
        "DTEND;TZID=" + tz + ":" + localStamp(e.dateISO, v.time24, v.durationMin),
        "SUMMARY:" + esc(title), "LOCATION:" + esc(place(v)), "DESCRIPTION:" + esc(desc),
        "URL:" + mapLink(v), "END:VEVENT"].join("\r\n");
    }
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Liorah Baptism//EN", "CALSCALE:GREGORIAN",
      vevent("ceremony", e.title + " of " + C.child.name, C.ceremony, "You are warmly invited to the " + e.title + " of " + C.child.name + "."),
      vevent("reception", "Reception — " + C.child.name + "’s Baptism", C.reception, "Reception following the baptism."),
      "END:VCALENDAR"].join("\r\n");
  }
  $("#calendarBtn").addEventListener("click", function () {
    var blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "liorah-baptism.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  });
  (function () {
    var e = C.event, v = C.ceremony;
    var dates = localStamp(e.dateISO, v.time24) + "/" + localStamp(e.dateISO, v.time24, v.durationMin);
    $("#gcalLink").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(e.title + " of " + C.child.name) +
      "&dates=" + dates + "&ctz=" + encodeURIComponent(e.timezone) +
      "&location=" + encodeURIComponent(place(v)) +
      "&details=" + encodeURIComponent("Reception to follow at " + place(C.reception) + ", " + C.reception.timeLabel + ".");
  })();

  /* ---------- 3. Music ---------- */
  var audio = $("#bgm"), musicBtn = $("#musicBtn"), musicOK = false;
  audio.src = C.music.src; audio.volume = C.music.volume;
  musicOK = true; musicBtn.hidden = false;
  audio.addEventListener("error", function () { musicOK = false; musicBtn.hidden = true; });
  audio.preload = "auto";

  function setMusicUI(on) {
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", on ? "Pause background music" : "Play background music");
  }
  function playMusic() {
    var p = audio.play();
    if (p && p.then) p.then(function () { setMusicUI(true); store.set("music", "on"); }).catch(function () { setMusicUI(false); });
    else setMusicUI(true);
  }
  function pauseMusic() { audio.pause(); setMusicUI(false); store.set("music", "off"); }
  musicBtn.addEventListener("click", function () { audio.paused ? playMusic() : pauseMusic(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && !audio.paused) { audio.pause(); audio.dataset.resume = "1"; } else if (!document.hidden && audio.dataset.resume) { delete audio.dataset.resume; playMusic(); } });

  /* ---------- 4. Opening video ---------- */
  // Flow: first frame + "Open Invitation" → tap plays video (and starts music) → last frame flows into the hero.
  var intro = $("#intro"), video = $("#introVideo"), skipBtn = $("#skipBtn"), entered = false, started = false;

  function enter() {
    if (entered) return; entered = true;
    video.pause();
    document.body.classList.remove("is-locked");
    window.scrollTo(0, 0);
    intro.classList.add("is-leaving");
    setTimeout(function () { intro.remove(); }, 1600);   // removed: the video can never restart
  }
  function begin() {
    if (started) return; started = true;
    // This tap is the user interaction that allows music; skipped only if the guest muted it before.
    if (musicOK && store.get("music") !== "off") playMusic();
    if (reduceMotion) { enter(); return; }
    intro.classList.add("is-playing"); skipBtn.hidden = false;
    var pp = video.play();
    if (pp && pp.catch) pp.catch(enter);
  }
  video.addEventListener("ended", function () {   // last frame: show the names, then flow into the hero
    if (entered) return;
    intro.classList.add("is-ending");
    setTimeout(enter, 3200);
  });
  video.addEventListener("error", function () { if (started) enter(); });
  $("#enterBtn").addEventListener("click", begin);
  skipBtn.addEventListener("click", enter);

  /* ---------- 5. Scroll reveals ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }) : null;
  function watch(el) { io ? io.observe(el) : el.classList.add("in"); }
  document.querySelectorAll(".reveal").forEach(watch);

  /* ---------- 6. Photos: hero, closing, gallery ---------- */
  var loaded = [];   // photos that actually exist
  function probe(p, i) {
    return new Promise(function (res) {
      var im = new Image(); im.decoding = "async";
      im.onload = function () { res({ src: p.src, alt: p.alt, fx: p.focusX, fy: p.focusY, w: im.naturalWidth, h: im.naturalHeight, i: i }); };
      im.onerror = function () { res(null); };
      im.src = p.src;
    });
  }
  function fillPortrait(fig, photo) {
    if (!photo) return;
    var img = document.createElement("img");
    img.alt = photo.alt; img.src = photo.src; if (photo.fx) fig.style.setProperty("--fx", photo.fx); if (photo.fy) fig.style.setProperty("--fy", photo.fy); img.decoding = "async"; img.width = photo.w; img.height = photo.h;
    img.onload = function () { img.classList.add("is-loaded"); fig.classList.add("has-photo"); };
    fig.appendChild(img);
  }
  Promise.all(C.photos.map(probe)).then(function (all) {
    loaded = all.filter(Boolean);
    function byIndex(i) { return all[i] || loaded[0] || null; }
    fillPortrait($("#heroPortrait"), byIndex(C.heroPhotoIndex));
    fillPortrait($("#closingPortrait"), byIndex(C.closingPhotoIndex));
    buildGallery();
  });

  function buildGallery() {
    if (!loaded.length) return;     // no photos supplied yet → section stays hidden
    var sec = $("#gallery"), grid = $("#galleryGrid");
    sec.hidden = false;
    loaded.forEach(function (p, idx) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "gallery__item"; b.style.setProperty("--d", (idx % 2) * 0.15 + "s");
      b.setAttribute("aria-label", "Open photo " + (idx + 1) + " of " + loaded.length);
      var img = document.createElement("img");
      img.src = p.src; img.alt = p.alt; img.width = p.w; img.height = p.h; img.loading = "lazy"; img.decoding = "async";
      b.appendChild(img);
      b.addEventListener("click", function () { openLightbox(idx, b); });
      grid.appendChild(b); watch(b);
    });
  }

  /* ---------- 7. Lightbox ---------- */
  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbCount = $("#lbCount"), cur = 0, lastFocus = null;
  function show(i, animate) {
    cur = (i + loaded.length) % loaded.length;
    var p = loaded[cur];
    function apply() { lbImg.src = p.src; lbImg.alt = p.alt; lbImg.classList.remove("is-swapping"); }
    lbCount.textContent = (cur + 1) + " / " + loaded.length;
    if (animate && !reduceMotion) { lbImg.classList.add("is-swapping"); setTimeout(apply, 220); } else apply();
  }
  function openLightbox(i, from) {
    lastFocus = from; lb.hidden = false; lb.classList.toggle("is-single", loaded.length < 2);
    document.body.style.overflow = "hidden"; show(i, false);
    requestAnimationFrame(function () { lb.classList.add("is-open"); $("#lbClose").focus(); });
  }
  function closeLightbox() {
    lb.classList.remove("is-open"); document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; }, 350);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", function () { show(cur - 1, true); });
  $("#lbNext").addEventListener("click", function () { show(cur + 1, true); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lightbox__figure")) closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") show(cur - 1, true);
    else if (e.key === "ArrowRight") show(cur + 1, true);
  });
  (function swipe() {
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null || loaded.length < 2) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
  })();

  /* ---------- 8. Dove: glides down the page with the guest ---------- */
  (function dove() {
    if (reduceMotion) return;
    var el = $("#dove"), turn = el.firstElementChild;
    var x = -0.3, y = 0.16, px = x, py = y, rot = 0, facing = 1, t0 = performance.now();
    var COL = 520;
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function frame(now) {
      var t = (now - t0) / 1000, vw = window.innerWidth, vh = window.innerHeight;
      var max = Math.max(1, document.documentElement.scrollHeight - vh);
      var p = clamp(window.scrollY / max, 0, 1);              // 0 (top) → 1 (bottom)
      // Weaves across the invitation column: scroll sets the course, time keeps it drifting gently.
      var phase = p * Math.PI * 2 * 3.2 + t * 0.16;
      var tx = 0.5 + 0.44 * Math.sin(phase) + 0.04 * Math.sin(t * 0.7);
      var ty = 0.2 + 0.13 * Math.sin(phase * 0.8 + 1) + 0.025 * Math.sin(t * 1.3) + 0.12 * p;
      x += (tx - x) * 0.012; y += (ty - y) * 0.012;           // eased, inertial flight
      var vx = x - px, vy = y - py; px = x; py = y;
      var want = vx >= 0 ? 1 : -1;
      if (want !== facing && Math.abs(vx) > 0.0004) { facing = want; turn.classList.toggle("is-left", facing < 0); }
      rot += (clamp(vy * 900, -14, 14) * facing - rot) * 0.06;       // pitch with climb / dive
      var colW = Math.min(vw, COL), left0 = (vw - colW) / 2, w = el.offsetWidth;
      var scale = 0.95 + 0.1 * Math.sin(phase * 0.5 + 2);
      el.style.transform = "translate3d(" + (left0 + x * colW - w / 2).toFixed(1) + "px," + (y * vh).toFixed(1) + "px,0) rotate(" + rot.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    var iv = setInterval(function () { if (!document.body.classList.contains("is-locked")) { el.classList.add("is-on"); clearInterval(iv); } }, 200);
  })();
})();
