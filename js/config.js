/* ==========================================================================
   INVITATION CONFIGURATION — edit everything here.
   ========================================================================== */
window.INVITE = {
  child: { name: "Liorah Bibin" },

  event: {
    title: "Holy Baptism",
    dayLabel: "Monday",
    dateLabel: "1 February 2027",
    dateISO: "2027-02-01",          // YYYY-MM-DD (used for calendar files)
    timezone: "Asia/Kolkata",       // IANA timezone (used for calendar files)
    utcOffset: "+05:30"             // used for the Google Calendar link
  },

  ceremony: {
    timeLabel: "4:30 PM",
    time24: "16:30",
    durationMin: 90,
    venue: "St Joseph's Church",
    place: "Nellimattom",
    /* Paste the church's Google Maps "Share" link between the quotes.
       If left empty, the button opens a Google Maps SEARCH for the venue name. */
    mapUrl: ""
  },

  reception: {
    timeLabel: "6:00 PM",
    time24: "18:00",
    durationMin: 180,
    venue: "C9 Event Centre",
    place: "",                      // optional town/area, e.g. "Kothamangalam"
    /* Paste the reception venue's Google Maps link here (same rule as above). */
    mapUrl: ""
  },

  /* Photographs of Liorah (the four supplied originals go in assets/images/).
     Files that are missing are skipped automatically. */
  photos: [
    { src: "assets/images/liorah-photo-01.webp", alt: "Liorah in pink dungarees and a pink bow", focusX: "50%", focusY: "22%" },
    { src: "assets/images/liorah-photo-02.webp", alt: "Liorah in a floral dress and ivory bow",  focusX: "40%", focusY: "12%" },
    { src: "assets/images/liorah-photo-03.webp", alt: "Liorah in a pumpkin hat, looking up",      focusX: "55%", focusY: "35%" },
    { src: "assets/images/liorah-photo-05.webp", alt: "Liorah in a cream pumpkin-spice sweater",  focusX: "50%", focusY: "25%" },
    { src: "assets/images/liorah-photo-06.webp", alt: "Liorah smiling in a pink knitted sweater", focusX: "45%", focusY: "28%" }
  ],
  // focusX / focusY = which point of the photo stays centred in the hero/closing frames (face).
  heroPhotoIndex: 0,                // which photo is used in the hero
  closingPhotoIndex: 1,             // which photo is used in the closing section

  music: {
    src: "assets/audio/instrumental.mp3",  // supply your own licensed/royalty-free file
    volume: 0.45
  }
};
