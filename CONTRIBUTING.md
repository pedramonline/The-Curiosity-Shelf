# Adding to the shelf

Give Codex the YouTube channel URL and any personal note about why you recommend it.

1. Add a unique, stable `id` in `src/data/channels.json`. Include name, text monogram, topics, style, description, audience, English practice tip and the verified channel URL.
2. Use a canonical `UC…` channel ID when available. The refresh script can resolve an unset ID from channel metadata. Verify the resulting feed belongs to the intended creator.
3. Add a concise card summary to `summaries` in `src/main.jsx`. Add topics to the filter list if necessary.
4. Run `npm run refresh`, `npm test` and `npm run build`. Check search, filters and the new channel detail.
5. Commit and push the reviewed change. GitHub Actions refreshes videos and redeploys.

Personal recommendations must come from Pedro. Do not invent quotations or label an automatically collected video as personally endorsed. Individual handpicked video recommendations can be added as a separate data collection when Pedro supplies them.

Descriptions are curated data. Feed refreshes write only `public/data/uploads.json`. Remove a channel from the channel file to remove it from the library and from the next feed snapshot.

