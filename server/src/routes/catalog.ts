import { Router } from "express";
import { prisma } from "../db.js";

export const catalogRouter = Router();

function parseTags(s: string | null): string[] {
  if (!s) return [];
  try {
    const a = JSON.parse(s);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

catalogRouter.get("/", async (_req, res) => {
  try {
    const directions = await prisma.direction.findMany({
      orderBy: { orderNum: "asc" },
      include: {
        programs: {
          orderBy: { orderNum: "asc" },
          select: {
            id: true,
            title: true,
            subtitle: true,
            slug: true,
            tags: true,
            shortDesc: true,
            duration: true,
            format: true,
            level: true,
            startDate: true,
            orderNum: true,
          },
        },
      },
    });
    const out = directions.map((d) => ({
      ...d,
      programs: d.programs.map((p) => ({
        ...p,
        tags: parseTags(p.tags),
      })),
    }));
    res.json({ directions: out });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load catalog" });
  }
});
