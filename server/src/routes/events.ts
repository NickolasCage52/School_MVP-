import { Router } from "express";

export const eventsRouter = Router();

const MAX_NAME = 64;
const MAX_PAYLOAD = 2000;

eventsRouter.post("/", (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.slice(0, MAX_NAME) : "";
  const payload = typeof req.body?.payload === "object" && req.body.payload !== null
    ? JSON.stringify(req.body.payload).slice(0, MAX_PAYLOAD)
    : "{}";
  if (!name) {
    return res.status(400).json({ error: "name required" });
  }
  console.log("[Event]", name, payload);
  res.status(204).end();
});
