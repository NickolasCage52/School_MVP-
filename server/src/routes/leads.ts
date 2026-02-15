import { Router } from "express";
import { prisma } from "../db.js";
import { normalizePhone, isPhoneValid } from "../lib/phone.js";

export const leadsRouter = Router();

const MAX_STRING = 200;
const MAX_COMMENT = 1000;
const MAX_ANSWERS_JSON = 2000;
const IDEMPOTENCY_WINDOW_MS = 15 * 60 * 1000; // 15 min

function sanitize(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.slice(0, MAX_STRING).trim();
}

function sanitizeComment(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.slice(0, MAX_COMMENT).trim();
}

function sanitizeJson(s: unknown, maxLen: number): string | null {
  if (s == null) return null;
  if (typeof s === "object") {
    const str = JSON.stringify(s);
    return str.length <= maxLen ? str : null;
  }
  return null;
}

const VALID_STATUSES = ["New", "In work", "Done", "Invalid"] as const;

leadsRouter.post("/", async (req, res) => {
  const body = req.body as Record<string, unknown>;

  // Honeypot: reject if filled
  const honeypot = typeof body.website === "string" ? body.website.trim() : "";
  if (honeypot.length > 0) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const programId = sanitize(body.programId);
  const programName = sanitize(body.programName);
  const direction = sanitize(body.direction);
  const selectedPackage = sanitize(body.selectedPackage);
  const priceShown = typeof body.priceShown === "number" && body.priceShown >= 0 ? Math.floor(body.priceShown) : null;
  const clientName = sanitize(body.clientName ?? body.name);
  const email = sanitize(body.email);
  let phoneRaw = sanitize(body.phone);
  const telegramUserId = sanitize(body.telegramUserId);
  const telegramUsername = sanitize(body.telegramUsername);
  const telegramFirstName = sanitize(body.telegramFirstName);
  const telegramLastName = sanitize(body.telegramLastName);
  const utmSource = sanitize(body.utmSource);
  const utmMedium = sanitize(body.utmMedium);
  const utmCampaign = sanitize(body.utmCampaign);
  const utmContent = sanitize(body.utmContent);
  const utmTerm = sanitize(body.utmTerm);
  const answers = sanitizeJson(body.answers, MAX_ANSWERS_JSON);
  const device = sanitizeJson(body.device, 500);

  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  if (phoneRaw && phone && !isPhoneValid(phone)) {
    return res.status(400).json({ error: "Некорректный номер телефона" });
  }

  if (!programId || !programName) {
    return res.status(400).json({ error: "programId and programName required" });
  }
  const hasContact = clientName || email || (phone && phone.length >= 10) || telegramUserId;
  if (!hasContact) {
    return res.status(400).json({ error: "Укажите имя, email, телефон или Telegram" });
  }

  try {
    // Rate limit per telegram user (same user max 3 leads per 10 min)
    if (telegramUserId) {
      const since = new Date(Date.now() - 10 * 60 * 1000);
      const recentCount = await prisma.lead.count({
        where: { telegramUserId, createdAt: { gte: since } },
      });
      if (recentCount >= 3) {
        return res.status(429).json({ error: "Слишком много заявок. Попробуйте позже." });
      }
    }

    // Idempotency: same user + program + phone within window
    const idempotencyKey = telegramUserId || phone || "";
    if (idempotencyKey) {
      const since = new Date(Date.now() - IDEMPOTENCY_WINDOW_MS);
      const existing = await prisma.lead.findFirst({
        where: {
          programId,
          createdAt: { gte: since },
          OR: [
            ...(telegramUserId ? [{ telegramUserId }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        return res.status(201).json({ id: existing.id, ok: true, duplicate: true });
      }
    }

    const lead = await prisma.lead.create({
      data: {
        programId,
        programName,
        direction: direction || null,
        selectedPackage: selectedPackage || null,
        priceShown,
        clientName: clientName || null,
        email: email || null,
        phone: phone || null,
        telegramUserId: telegramUserId || null,
        telegramUsername: telegramUsername || null,
        telegramFirstName: telegramFirstName || null,
        telegramLastName: telegramLastName || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmContent: utmContent || null,
        utmTerm: utmTerm || null,
        answers,
        device,
        payload: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...(body.initDataSubset ? { initDataSubset: body.initDataSubset } : {}),
        }),
      },
    });
    res.status(201).json({ id: lead.id, ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Не удалось сохранить заявку" });
  }
});
