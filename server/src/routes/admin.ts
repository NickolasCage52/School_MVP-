import { Router } from "express";
import { prisma } from "../db.js";

const VALID_STATUSES = ["New", "In work", "Done", "Invalid"] as const;

export const adminRouter = Router();

function requireAdmin(req: { headers: { authorization?: string } }, res: { status: (n: number) => { json: (o: object) => void } }, next: () => void) {
  const token = process.env.ADMIN_TOKEN;
  const header = req.headers.authorization;
  const provided = header?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token || provided !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

adminRouter.use(requireAdmin);

const PAGE_SIZE = 50;

adminRouter.get("/leads", async (req, res) => {
  const programId = typeof req.query.programId === "string" ? req.query.programId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  const page = Math.max(0, parseInt(String(req.query.page), 10) || 0);
  try {
    const where: Record<string, unknown> = {};
    if (programId) where.programId = programId;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, string>).gte = new Date(from).toISOString();
      if (to) (where.createdAt as Record<string, string>).lte = new Date(to).toISOString();
    }
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.lead.count({ where }),
    ]);
    res.json({ leads, total, page, pageSize: PAGE_SIZE });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load leads" });
  }
});

adminRouter.patch("/leads/:id", async (req, res) => {
  const id = req.params.id;
  const status = typeof (req.body as { status?: string }).status === "string"
    ? (req.body as { status: string }).status
    : undefined;
  if (!status || !(VALID_STATUSES as readonly string[]).includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });
    res.json(lead);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

adminRouter.get("/leads/export", async (req, res) => {
  const programId = typeof req.query.programId === "string" ? req.query.programId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  try {
    const where: Record<string, unknown> = {};
    if (programId) where.programId = programId;
    if (status) where.status = status;
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    const headers = [
      "id", "createdAt", "updatedAt", "status", "programId", "programName", "direction",
      "selectedPackage", "priceShown", "clientName", "email", "phone",
      "telegramUserId", "telegramUsername", "telegramFirstName", "telegramLastName",
      "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
      "answers", "device",
    ];
    const escape = (v: string | null | undefined) => {
      const s = String(v ?? "");
      if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const rows = leads.map((l) =>
      headers.map((h) => escape((l as Record<string, unknown>)[h] as string)).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.send("\uFEFF" + csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Export failed" });
  }
});

adminRouter.get("/programs", async (_req, res) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { orderNum: "asc" },
      select: { id: true, title: true },
    });
    res.json({ programs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load programs" });
  }
});
