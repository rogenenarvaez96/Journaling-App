# Self-Hosted Journal

A private, secure, and fully self-hosted journaling platform built on the MERN stack. Designed for individuals who want complete ownership over their thoughts, memories, and data without relying on third-party cloud services.

## Core Features

- **Distraction-Free Editor:** Rich text formatting (via React Quill) to focus entirely on writing.
- **Private Image Gallery:** Attach images to entries. Uploads are strictly isolated to the user's secure directory—no public links.
- **Admin Controls:** The first user automatically becomes the Admin. You can globally disable public registration to lock down your server.
- **Data Ownership (Backups):** One-click export of your entire database and image gallery into an encrypted ZIP file. You can restore this archive at any time.
- **Mood & Tag Tracking:** Categorize entries and track your mood over time with an interactive analytics dashboard.
- **Responsive & Dark Mode:** Fully responsive UI with a built-in dark/light theme toggle that persists across sessions.

## Tech Stack

- **Frontend:** React (Vite), TailwindCSS, React Router, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT for authentication.
- **File Handling:** Multer, Archiver (for encrypted backups).
- **Deployment Ready:** Ships with `ecosystem.config.cjs` for PM2, NGINX templates, and GitHub Actions workflows for bare-metal/Proxmox deployment.

---

## Local Development Setup

To run this locally, you'll need Node.js (v20+) and a running MongoDB instance.

### 1. Clone the repository
```bash
git clone https://github.com/rogenenarvaez96/Journaling-App.git
cd Journaling-App
```

### 2. Setup the Backend
Navigate to the `server` directory, install dependencies, and configure your environment:
```bash
cd server
npm install
cp .env.example .env
```
Open the `.env` file and set your `MONGO_URI`, `JWT_SECRET`, and `REFRESH_TOKEN_SECRET`.

Start the development server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal, navigate to the `client` directory, and install dependencies:
```bash
cd client
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`. 

*(Note: The very first account you register will automatically be granted Admin privileges.)*

## Production Deployment

This project is built to be deployed on a standard Ubuntu VM (e.g., via Proxmox) sitting behind a Cloudflare Tunnel.

1. **Proxying:** The React app is compiled to static files (`npm run build`) and served by NGINX. NGINX proxies all `/api` requests to the local PM2 Node process. This entirely eliminates CORS issues.
2. **PM2:** Run the backend using the provided `ecosystem.config.cjs`.
3. **CI/CD:** Use the included `.github/workflows/deploy.yml` with a self-hosted GitHub Runner to automate your deployments on `git push`.

## License
MIT License. Do whatever you want with it.
