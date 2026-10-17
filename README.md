# Anime Ki Duniya — API-enabled update

## What changed
- Anime catalogue now loads live results from the Jikan API (MyAnimeList-derived metadata), including poster images, titles, scores, genres, studios, episode counts, status, and synopsis where available.
- Search runs against the live API when you click Explore or press Enter.
- The AI article button calls a server-side Netlify Function. The OpenAI key is never put in browser JavaScript.
- Drafts can be saved in the current browser or downloaded as Markdown.
- No article is published automatically. Saved browser drafts do not sync between devices.

## Deploy to Netlify
1. Extract this ZIP and upload the extracted project to your GitHub repository, replacing the old files. Keep `index.html` in the repository root.
2. In Netlify, open **Site configuration → Environment variables** (wording can vary) and add:
   - `OPENAI_API_KEY` = your secret OpenAI API key
   - Optional: `OPENAI_MODEL` = `gpt-4.1-mini`
3. Trigger a new deploy in Netlify. The `netlify.toml` file configures the functions directory.
4. Open the deployed website, search for a known title, and open a card. Then try AI draft generation.
5. If AI generation fails, check **Netlify → Functions → generate-blog → Logs**. Never paste your API key into chat, GitHub source, or browser code.

## Important limitations
- Jikan is an unofficial API and can rate-limit requests; if you see a rate-limit message, wait before retrying.
- Jikan does not provide reliable regional streaming or Hindi/English dub availability, so those filters are disabled rather than showing invented information.
- AI output must be fact-checked and edited. The current build generates and saves/downloads drafts but does not have a secure multi-user admin dashboard, shared database, scheduled daily generation, or one-click public publishing. Those require a CMS/database and authentication before it is safe to publish from a public website.
