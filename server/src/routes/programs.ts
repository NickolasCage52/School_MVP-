import { Router } from "express";
import { prisma } from "../db.js";

export const programsRouter = Router();

function parseJson(s: string | null | undefined): unknown {
  if (s == null || s === "") return [];
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}

programsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (process.env.NODE_ENV !== "production") {
    console.log("[programs] GET /programs/" + id);
  }
  try {
    const program = await prisma.program.findFirst({
      where: { id },
      include: {
        direction: { select: { name: true, slug: true } },
        packages: { orderBy: { orderNum: "asc" } },
      },
    });
    if (!program) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[programs] 404 program not found:", id);
      }
      return res.status(404).json({ error: "Программа не найдена" });
    }
    const direction = program.direction
      ? { name: program.direction.name, slug: program.direction.slug }
      : null;
    const out = {
      id: program.id,
      directionId: program.directionId,
      direction,
      title: program.title,
      subtitle: program.subtitle ?? null,
      slug: program.slug,
      tags: parseJson(program.tags),
      shortDesc: program.shortDesc ?? null,
      targetAudience: parseJson(program.targetAudience),
      outcomes: parseJson(program.outcomes),
      structure: parseJson(program.structure),
      duration: program.duration ?? null,
      format: program.format ?? null,
      level: program.level ?? null,
      startDate: program.startDate ?? null,
      faq: parseJson(program.faq),
      howItWorks: program.howItWorks ?? null,
      testimonials: parseJson(program.testimonials),
      instructors: parseJson(program.instructors),
      orderNum: program.orderNum,
      packages: (program.packages ?? []).map((p) => ({
        id: p.id,
        programId: p.programId,
        name: p.name,
        price: p.price,
        features: parseJson(p.features) as string[],
        recommended: p.recommended,
        orderNum: p.orderNum,
      })),
    };
    res.json(out);
  } catch (e) {
    console.error("[programs] Error loading program", id, e);
    res.status(500).json({ error: "Не удалось загрузить программу. Попробуйте позже." });
  }
});
