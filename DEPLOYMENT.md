# Deployment instructions for Netlify Frontend + Render Backend

## Netlify Frontend Setup

1. **Connect repository** to Netlify from your GitHub/GitLab
2. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Environment variables** (in Netlify UI → Site settings → Environment):
   - `RENDER_BACKEND_URL`: Your Render backend URL (e.g., `https://your-service.onrender.com`)
   - `RENDER_BACKEND_URL_WS`: Same as above (for WebSocket redirects)

4. The `netlify.toml` file already configured to route `/api/*` and `/ws/*` to Render.

## Render Backend Setup

1. **Create new Web Service** on Render.com
2. **Connect repository** (point to your GitHub repo)
3. **Configure build & deploy:**
   - Build command: `pip install -r backend/requirements.txt`
   - Start command: `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT wsgi:app`
   - Root directory: Leave empty (or `.`)

4. **Environment variables** (in Render UI → Environment):
   - `POSTGRESQL_URI`: Your Railway Postgres URI
   - `MONGODB_URI`: Your MongoDB connection string
   - `REDIS_URL`: Redis connection (e.g., `redis://localhost:6379/0` or managed Redis)
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps key
   - `FLASK_SECRET_KEY`: A strong random secret

5. **Port:** Render will set `PORT` env var; `gunicorn` command uses `$PORT` automatically.

## Database Migrations on Render

After first deployment, run migrations via Render's "Manual Deploy" or shell:

```bash
# SSH into Render instance or use build hooks
alembic upgrade head
```

Or add to `render.yaml` if using it:
```yaml
pre_deploy_command = "alembic upgrade head"
```

## Testing Production URLs

- **Frontend:** `https://<your-netlify-site>.netlify.app`
- **Backend:** `https://<your-render-service>.onrender.com`
- **API calls:** Frontend at `/api/*` → redirects to backend `/api/*` (via netlify.toml)
- **WebSocket:** Frontend at `/ws/*` → redirects to backend `/ws/*` (via netlify.toml)

## Notes

- Do NOT commit `.env` or `.env.local` (already in `.gitignore`)
- Render reads `POSTGRESQL_URI`, `MONGODB_URI` etc. from environment variables
- Gunicorn + eventlet worker handles Flask-SocketIO + concurrent connections
- If you see timeout errors, increase Render's Web Service plan or adjust worker count in start command
