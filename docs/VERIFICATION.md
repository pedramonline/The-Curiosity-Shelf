# Verification

2026-09-09

- Production build passes.
- Six Python regression tests pass: Atom parsing, entity decoding, canonical channel identity, prefixless IDs, failure retention and partial-refresh/removal behavior.
- All 14 public channel feeds refreshed successfully; 126 genuine recent uploads saved.
- Browser checks pass: search, topic filters, empty-state reset, channel details, Escape and focus restoration, surprise selection, upload pagination, theme toggle, loading failure and retry.
- No horizontal overflow at 375, 768, 1024 or 1440 pixels. No JavaScript errors in interaction checks.
- Desktop and mobile screenshots visually inspected against generated references.
- Local production Lighthouse: performance 98, accessibility 100, best practices 100, SEO 100. Local lab results are not a guarantee of real-user performance.

Raw screenshots and Lighthouse JSON remain local in docs/qa and are excluded from Git to keep the repository lean.

Channel visuals update: all 14 verified avatars and featured thumbnails load; 28 additional previews and nine uploads per channel detail. Eight feed/artwork tests and browser interaction checks pass. Real-image update Lighthouse: 98 performance, 100 accessibility, 100 best practices, 100 SEO.
