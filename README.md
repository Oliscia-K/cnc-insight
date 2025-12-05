# personal_website

## Local Postgres for file storage

This project includes a Docker Compose service that runs Postgres and initializes a `files` table used by the upload API.

Quick start:

1. Start Postgres:

```bash
npm run db:up
```

2. (Optional) View logs:

```bash
npm run db:logs
```

3. Start the Next.js dev server:

```bash
npm run dev
```

4. Open http://localhost:3000/fileUpload and try uploading a small file. The file is saved into Postgres and can be downloaded from the URL returned by the upload route (e.g. `/api/file/<id>`).

Notes:
- The DB init SQL is in `db/init/init.sql` and creates a `files` table with columns: id, filename, content_type, data (bytea), and created_at.
- If you want to change credentials or DB name, edit `docker-compose.yml` and update `.env.local` accordingly.
