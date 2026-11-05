# SmartQueue — corrected React + Node + MySQL project

Use this `QUEUE` folder as the project root. The older `SmartQueue/frontend` and
`SmartQueue/backend` folders are a separate/older implementation; do not mix them
with this version.

## Requirements
- Node.js 20.19+ (Node 22 LTS recommended)
- MySQL Server running
- VS Code (optional)

## 1. Configure database
1. Open `backend/.env`.
2. Set `DB_PASSWORD` to your own MySQL root password.
3. Keep `DB_NAME=smart_queue_db`.

The provided `.env` is a template. `YOUR_MYSQL_PASSWORD` must be replaced.

## 2. Create database/table (first run only)
Open a terminal in this `QUEUE` folder and run:

```bash
cd backend
npm install
npm run setup-db
```

## 3. Install frontend dependencies
Open a second terminal:

```bash
cd frontend
npm install
```

## 4. Run
From the `QUEUE` folder, double-click `start.bat`, OR run these in two terminals:

Terminal 1:
```bash
cd backend
npm start
```

Terminal 2:
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in Chrome. Do not open `index.html` with Live Server.
Keep both terminal windows running.

## Check backend
Open http://localhost:5000/api/health. Expected:
`{"status":"ok","database":"connected"}`

## If something still fails
- `Access denied for user 'root'`: fix `DB_PASSWORD` in `backend/.env`.
- `Unknown database` / missing table: run `npm run setup-db` from `backend`.
- Port 5000/5173 already in use: close the old server terminal or stop the process using that port.
- `npm` not recognized: install Node.js LTS, restart VS Code, and run `node -v` and `npm -v`.
- Browser says API/network error: confirm backend health URL works first.

## Main routes
- Customer booking: `/`
- Token status: `/status/:id`
- Admin dashboard: `/admin`
- Feedback: `/feedback`

## Security note
The original archive included a database password in plain text. Use your own password,
do not upload `.env` to GitHub, and change the MySQL password if the exposed value was
a real password used outside this project.
