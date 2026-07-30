import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
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




const app = express()


app.use(cors({ origin: [config.CORS_ORIGIN], credentials: true }))
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



app.use("/api/settings", settingsRoutes);



app.use("/api/history", historyRoutes);



app.use("/api/teams", teamRoutes);


app.use("/api/webhooks", webhookRoutes);

export default app
