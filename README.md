# 📌 Google Tasks → Notion Sync

A backend app that automatically syncs your Google Tasks into a Notion database every 5 minutes. Built using Node.js, Express, Google Tasks API, and Notion API.

## ✨ Features

- 🔄 Auto-syncs Google Tasks to Notion every 5 minutes
- ⚡ Manual sync via `/sync` endpoint
- ✅ Supports task fields: Title, Status, Due Date, Description
- 🧠 Prevents duplicates using local task ID tracking
- 🧩 Modular and clean code structure
- 🔐 Secure via `.env` for API tokens and secrets

## 🚀 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/google-tasks-notion-sync.git
cd google-tasks-notion-sync
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root:
```
NOTION_TOKEN=your_notion_integration_secret
NOTION_DATABASE_ID=your_notion_database_id
PORT=3000
```

### 4. Add Google OAuth Credentials
- Create a project at [Google Cloud Console](https://console.cloud.google.com/)
- Enable **Google Tasks API**
- Generate **OAuth2 Credentials** for Desktop
- Save as `credentials.json` in the root directory

## 🧪 First-Time Run (Google Auth Flow)
```bash
node server.js
```
- This will print a URL — open it in your browser and authorize the app
- Paste the returned auth code into the terminal
- It saves your token in `token.json`

## ✅ Manual Sync
Start server:
```bash
node server.js
```

Trigger manual sync:
```
GET http://localhost:3000/sync
```

## ⏱️ Auto Sync (Every 5 Minutes)
The app uses `node-cron` to sync your tasks every 5 minutes automatically.

Logs will show:
```
⏱️ Running scheduled sync...
✅ Sync complete.
```

## 📌 Notion Setup
- Create a database in Notion with these properties:
  - `Task` → Title
  - `Status` → Select (e.g. Not Started, Completed)
  - `Due` → Date
  - `Description` → Text
- Share the database with your integration

## 🛡️ Notes
- Google access is limited to test users unless you publish and verify the app
- This app runs locally and stores token files (`token.json`, `synced_tasks.json`) persistently
- No frontend, just a clean backend API with logging
