import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { catalogRouter } from "./routes/catalog.js";
import { programsRouter } from "./routes/programs.js";
import { leadsRouter } from "./routes/leads.js";
import { adminRouter } from "./routes/admin.js";
import { eventsRouter } from "./routes/events.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: true }));
app.use(express.json());

const leadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests" },
});
app.use("/api/leads", leadLimiter);

app.use("/api/catalog", catalogRouter);
app.use("/api/programs", programsRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/events", eventsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nПорт ${PORT} уже занят. Освободите его или завершите другой процесс:\n  Windows: for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT}') do taskkill /F /PID %a\n  Или закройте другое окно/терминал, где запущен сервер.\n`);
    process.exit(1);
  }
  throw err;
});
