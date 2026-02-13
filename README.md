# NOG Deck Studio

Production-grade monorepo for deterministic PowerPoint generation and conversion.

## Architecture
- `apps/web`: Next.js UI (Convert, Creative NOG, Jobs)
- `apps/api`: FastAPI + Celery orchestration, deck extraction, AI optional pipeline, validation
- `apps/renderer`: Node + PptxGenJS deterministic PPT renderer
- `infra/docker-compose.yml`: web + api + worker + renderer + redis

## Modes
1. **Template-Locked**: old.pptx + template.pptx, overwrite template placeholders to preserve template-bound behavior.
2. **Creative NOG**: old.pptx or outline text -> DeckModel -> classify -> SlideSpec -> validate/fix -> render.

## Optional OpenAI
- Without `OPENAI_API_KEY`: rules-only mode.
- With `OPENAI_API_KEY`: Responses API called for classification + SlideSpec generation.
- Prompt/response artifacts are logged in job `job.json` logs for audit.

## Run locally
```bash
cd infra
docker compose up --build
```
Web: `http://localhost:3000`
API: `http://localhost:8000/api/health`

## Env vars
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional, defaults in API config)

## Troubleshooting
- **LibreOffice missing**: thumbnails are skipped but PPT generation still works.
- **Font availability**: renderer requests Aptos Black; if unavailable, PowerPoint system fallback is used.
- **Redis down**: background jobs will queue fail; check `redis` container.

## Testing
```bash
cd apps/api && pip install -r requirements.txt && pytest -q
cd apps/renderer && npm install && npm test
cd apps/web && npm install && npm run build
```

## Publish to GitHub + get a public weblink

I cannot directly push to your GitHub account from this environment, but the repo is now structured for immediate publishing and deployment.

### 1) Push this repo to GitHub

```bash
git remote add origin https://github.com/<your-org-or-user>/nog-deck-studio.git
git push -u origin work
```

### 2) Deploy quickly on Render (Blueprint)

A Render blueprint is included at `infra/render.yaml`.

1. In Render, choose **New +** -> **Blueprint**.
2. Select your GitHub repo/branch.
3. Use `infra/render.yaml`.
4. After initial provisioning, set these env vars in Render:
   - `RENDERER_URL` on `nog-api` to your actual renderer URL (e.g. `https://nog-renderer.onrender.com`)
   - `NEXT_PUBLIC_API_URL` on `nog-web` to your actual API URL + `/api` (e.g. `https://nog-api.onrender.com/api`)
   - `OPENAI_API_KEY` (optional) on `nog-api` and worker if you want AI-assisted mode.
5. Re-deploy services.

### 3) Verify public endpoints

- Web: `https://<your-web-service>.onrender.com`
- API health: `https://<your-api-service>.onrender.com/api/health`
- Renderer health: `https://<your-renderer-service>.onrender.com/health`

### 4) Smoke test from your machine

```bash
curl https://<your-api-service>.onrender.com/api/health
curl https://<your-renderer-service>.onrender.com/health
```

If both are healthy, open the web URL and run:
- Template-Locked conversion flow
- Creative NOG generation flow
- Jobs download/delete flow


## GitHub Pages UI (simple control panel)

If you want a pure static UI on GitHub Pages, use `docs/index.html`.

### Enable GitHub Pages
1. Push this repo to GitHub.
2. In repo settings -> Pages, set source to `main` (or `work`) branch, folder `/docs`.
3. Open `https://<user>.github.io/<repo>/`.

### Important
GitHub Pages only hosts the UI. Jobs run on your deployed backend services.
In the page, set **API Base URL** to your deployed API (example: `https://nog-api.onrender.com/api`).

From that UI you can:
- Run Template-Locked conversion
- Run Creative NOG generation
- Track/download/delete jobs
- Inspect SlideSpec JSON


## Creative process and rule enforcement

When you upload an old deck in Creative NOG mode, the system stores the file in the job folder and uses it as a **reference source** (not a strict visual copy).

Pipeline used:
1. Extract DeckModel (title, slide titles, bullets, raw text blocks).
2. Classify slide intent (rules-first; OpenAI optional).
3. Generate SlideSpec JSON (template type, motif, palette map, text blocks, animation sequence).
4. Validate + auto-fix constraints:
   - Only allowed NOG palette colours (+ near-white for readability)
   - Minimum text sizes (title >= 32pt, body >= 24pt)
   - Split overflow content into part 2 slide
5. Deterministic renderer converts SlideSpec -> PPTX.

This means you get creativity while still staying inside guardrails and repeatable output logic.
