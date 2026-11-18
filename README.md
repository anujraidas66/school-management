# Bright Future Academy

A React 19 frontend and Express backend for the school website. Admission enquiries, administrator sessions, programs, and facilities are stored in MongoDB. The `/admin` dashboard lets staff manage enquiries and edit the programs and facilities displayed on the public website.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```powershell
npm install
Copy-Item .env.example .env
# Edit .env and set your MongoDB Atlas connection string and unique admin credentials.
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`). The API runs at `http://localhost:3000`; Vite proxies `/api` requests to it.

Open `/admin` on the Vite URL to sign in. Manage programs at `/admin/programs` and facilities at `/admin/facilities`; administrators can add, edit, delete, and reorder these items. Updates are saved to MongoDB and served on the public website. Set `MONGODB_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and an `ADMIN_SESSION_SECRET` with at least 32 characters in `.env`. Use a unique, strong admin password and keep `.env` private. For Atlas, create a database user, allow your development IP address in Network Access, and use the connection string provided by Atlas. On startup the backend creates the named collections and indexes if they do not already exist, and seeds the initial programs and facilities once. Do not commit the `.env` file.

## Production

```powershell
npm run build
$env:NODE_ENV = "production"
npm start
```

The Express server serves the built frontend and API on port 3000. Set `PORT` to change the server port. Production admin cookies are secure and require HTTPS.

The API exposes `GET /api/health`, public `GET /api/programs` and `GET /api/facilities` endpoints, `POST /api/enquiries`, and authenticated `/api/admin/*` routes. Enquiry submissions, content edits, and status changes are validated on the server before they are stored.
