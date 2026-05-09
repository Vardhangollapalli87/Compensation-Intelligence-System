import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { normalizeCompany, computeMedian } from '../utils/normalize';

const router = Router();

// GET /company/:company
router.get('/company/:company', async (req: Request, res: Response) => {
  const company = normalizeCompany(req.params.company);

  const salaries = await prisma.salary.findMany({
    where: { company },
    orderBy: { total_compensation: 'desc' },
  });

  if (salaries.length === 0) {
    return res.status(404).json({ error: `No salary data found for "${company}"` });
  }

  const medianComp = computeMedian(salaries.map((s) => s.total_compensation));
  const medianBase = computeMedian(salaries.map((s) => s.base_salary));

  // Level distribution
  const levelDistribution: Record<string, number> = {};
  for (const s of salaries) {
    levelDistribution[s.level] = (levelDistribution[s.level] ?? 0) + 1;
  }

  return res.json({
    company,
    salaries,
    stats: {
      median_compensation: Math.round(medianComp * 100) / 100,
      median_base: Math.round(medianBase * 100) / 100,
      total_entries: salaries.length,
      level_distribution: levelDistribution,
    },
  });
});

// GET /companies — list all unique companies with entry counts
router.get('/companies', async (_req: Request, res: Response) => {
  const grouped = await prisma.salary.groupBy({
    by: ['company'],
    _count: { id: true },
    _avg: { total_compensation: true },
    orderBy: { _count: { id: 'desc' } },
  });

  return res.json(
    grouped.map((g) => ({
      company: g.company,
      count: g._count.id,
      avg_total_compensation: Math.round((g._avg.total_compensation ?? 0) * 100) / 100,
    }))
  );
});

export default router;
