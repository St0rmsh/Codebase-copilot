# Codebase Copilot

**Understand a repository by asking questions about its code.** Codebase Copilot indexes GitHub repositories, retrieves relevant source, and answers with file and line citations. It also includes repository diagnostics and team collaboration tools.

> **Live demo:** Coming soon. A hosted demo link will be added here when deployment is available.

## Highlights

- Stream questions about a repository and inspect cited source code.
- Search code, trace symbols, explore dependency graphs, and review pull requests.
- Generate onboarding documentation and inspect repository indexing status.
- Compare code across repositories.
- Organize shared repositories in teams, invite members by email, and manage team admins.
- Automatically sync a repository after GitHub pushes using a webhook.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | React, Vite, Redux, Tailwind CSS |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Code indexing | Babel AST parsing, language-specific chunkers, Mistral embeddings |
| Retrieval | MongoDB Atlas Vector Search |
| Assistant | Mistral with Cohere fallback |
| Integrations | GitHub OAuth, GitHub webhooks, SMTP email |

## Requirements

- Node.js 22.12 or newer
- MongoDB Atlas with Vector Search enabled
- A Mistral API key for embeddings and chat
- A Cohere API key for chat fallback
- A GitHub OAuth app for connecting repositories
- SMTP credentials for account verification, team OTPs, and invitations

## Local Setup

### 1. Configure the backend

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

GITHUB_CLIENT_ID=<github-oauth-client-id>
GITHUB_CLIENT_SECRET=<github-oauth-client-secret>
GITHUB_CALLBACK_URL=http://localhost:3000/api/github/callback

MISTRAL_API_KEY=<mistral-api-key>
COHERE_API_KEY=<cohere-api-key>
COHERE_MODEL=command-a-03-2025

SMTP_EMAIL=<smtp-email>
SMTP_APP_PASSWORD=<smtp-app-password>

# Required for GitHub push auto-sync; must be publicly reachable over HTTPS.
BACKEND_URL=https://<public-backend-host>
```

The GitHub OAuth app callback URL must match `GITHUB_CALLBACK_URL`. Auto-sync cannot deliver webhooks to localhost; use a deployed HTTPS backend or a public HTTPS tunnel.

### 2. Create the Atlas Vector Search index

Create a Vector Search index on the `chunks` collection named `chunk_vector_index` with this definition:

```json
{
	"fields": [
		{
			"type": "vector",
			"path": "embedding",
			"numDimensions": 1024,
			"similarity": "cosine"
		},
		{
			"type": "filter",
			"path": "repo"
		}
	]
}
```

### 3. Install and run

In one terminal:

```bash
cd backend
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to the backend at `http://localhost:3000`.

## How Indexing Works

1. Connect GitHub and select a repository.
2. The backend clones it, skips generated assets and dependency folders, and extracts code chunks.
3. Chunks receive Mistral embeddings in batches and are stored in MongoDB.
4. Chat embeds each question, retrieves relevant chunks with Atlas Vector Search, and streams an answer with citations.

Supported source files are parsed for symbols; files without extractable symbols can be indexed as bounded whole-file chunks. Generated bundles and minified assets are excluded to keep retrieval focused on source.

## Project Layout

```text
backend/
	src/
		controllers/  HTTP handlers
		dao/          MongoDB access
		models/       Mongoose schemas
		routes/       Express routes
		services/     Indexing, chat, teams, and integrations
		utils/        Chunking, embeddings, and shared utilities
frontend/
	src/
		App/          Routing and app state
		features/     Feature-specific components and services
		pages/        Application pages
```

## Checks

```bash
cd frontend
npm run lint
npm run build
```

The backend currently has no automated test suite configured.

## Security Notes

- Keep `.env` files and credentials out of source control.
- GitHub webhook auto-sync requires the connected GitHub account to have repository admin access.
- Team creation and joining use email OTPs that expire after 10 minutes.
