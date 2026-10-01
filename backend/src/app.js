import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import config from "./config/config.js"
import authRoutes from "./routes/auth.routes.js"
import githubRoutes from "./routes/github.routes.js";
import repoRoutes from "./routes/repo.routes.js";
import chunkRoutes from "./routes/chunk.routes.js";
import multiRepoChatRoutes from "./routes/multiRepoChat.routes.js";
import indexingRoutes from "./routes/indexing.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import historyRoutes from "./routes/history.routes.js";
import teamRoutes from "./routes/team.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import publicExploreRoutes from "./routes/publicExplore.routes.js";


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// built frontend output (backend root / public)
const publicDir = path.resolve(__dirname, "../public")


const app = express()


app.use(cors({ origin: [config.CORS_ORIGIN || 'http://localhost:5174'], credentials: true }))
app.use(express.json({ limit: "10mb", verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }))
app.use(cookieParser())
app.use(morgan("dev"))


// @routes  http://localhost:3000/api/auth
// auth routes
app.use("/api/auth", authRoutes);


// @routes http://localhost:3000/api/github
// github routes
app.use("/api/github", githubRoutes);

// @routes http://localhost:3000/api/repos
// repo routes
app.use("/api/repos", repoRoutes);


// @routes http://localhost:3000/api/repos
// repos routes
app.use("/api/repos", chunkRoutes);


// @routes http://localhost:3000/api/multi-repo-chat
// multi-repo chat routes
app.use("/api/multi-repo-chat", multiRepoChatRoutes);


// @routes http://localhost:3000/api/indexing
// indexing routes
app.use("/api/indexing", indexingRoutes);


// @routes http://localhost:3000/api/settings
// settings routes
app.use("/api/settings", settingsRoutes);



// @routes http://localhost:3000/api/history
// history routes
app.use("/api/history", historyRoutes);


// @routes http://localhost:3000/api/teams
// teams routes
app.use("/api/teams", teamRoutes);


// @routes http://localhost:3000/api/webhooks
// webhook routes
app.use("/api/webhooks", webhookRoutes);


// @routes http://localhost:3000/api/explore
// public explore routes
app.use("/api/explore", publicExploreRoutes);


// unknown /api routes return JSON 404 instead of the frontend page
app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" })
})


// serve the built frontend (dist/public) and fall back to index.html for SPA routes
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir))

    app.use((req, res, next) => {
        if (req.method !== "GET") return next()
        res.sendFile(path.join(publicDir, "index.html"))
    })
}

export default app