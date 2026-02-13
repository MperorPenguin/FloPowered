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
