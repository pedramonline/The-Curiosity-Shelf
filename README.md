# The Curiosity Shelf

English-language channels curated by Pedro for students, friends and curious minds.

## Run

Requires Node.js 22+ and Python 3.12+.

```sh
npm ci
npm run dev
```

- `npm run build`: static website in `dist/`.
- `npm run refresh`: public YouTube Atom feeds, no API key.
- `npm test`: feed parsing and cache preservation tests.
- `node scripts/browser-check.mjs`: browser checks (requires Microsoft Edge).

## Collection

All 14 channels from Pedro's English YouTube Library, searchable by subject or channel, with original descriptions and audience notes. English practice activities and short card summaries were added for this website. Fresh uploads are automatically collected and clearly separated from personal curation.

## Publish

The workflow `.github/workflows/pages.yml` deploys GitHub Pages on pushes to main, manual runs and every six hours. Set **Settings > Pages > Source > GitHub Actions**. Scheduled runs may be delayed, and GitHub can disable schedules in inactive public repositories after 60 days. Re-enable in Actions if necessary.

The cached feed retains previous uploads if a channel fails. The website displays the last successful refresh and partial-failure notices. The initial snapshot contains real uploads, not invented video titles. Curated descriptions are never overwritten by a refresh.

## Add to the library

See [CONTRIBUTING.md](CONTRIBUTING.md). Give Codex a channel link and your recommendation. Channel data lives in `src/data/channels.json`. Review, build and push the update to publish it.

## Sources and assets

Descriptions and audience notes: Pedro's English YouTube Library (2025). The source Google document is unchanged. Channel avatars are retrieved from verified YouTube channel metadata; each channel entry includes real thumbnails and a recent-upload feed. Video thumbnails come from YouTube and link to their videos. No embedded players, analytics or user accounts.

Hero artwork and design references were created with the built-in image generation tool. See [design notes](docs/design/README.md).

- [YouTube feed documentation](https://developers.google.com/youtube/v3/guides/push_notifications)
- [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
