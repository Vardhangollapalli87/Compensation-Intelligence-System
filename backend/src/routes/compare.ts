import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

const LEVEL_ORDER: Record<string, number> = {
  L3: 3, L4: 4, L5: 5, L6: 6, L7: 7, L8: 8,
};

function levelDiffLabel(a: { company: string; level: string }, b: { company: string; level: string }): string {
  const la = LEVEL_ORDER[a.level] ?? 0;
  const lb = LEVEL_ORDER[b.level] ?? 0;
  const diff = la - lb;
  if (diff === 0) return 'Same level';
  if (diff > 0) return `${a.company.toUpperCase()} ${a.level} is ${diff} level(s) above ${b.company.toUpperCase()} ${b.level}`;
  return `${b.company.toUpperCase()} ${b.level} is ${Math.abs(diff)} level(s) above ${a.company.toUpperCase()} ${a.level}`;
}

// GET /compare?ids=id1,id2
router.get('/compare', async (req: Request, res: Response) => {
  const { ids } = req.query;

  if (!ids || typeof ids !== 'string') {
    return res.status(400).json({ error: 'Provide exactly 2 salary IDs: ?ids=id1,id2' });
  }

  const idList = ids
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (idList.length !== 2) {
    return res.status(400).json({ error: 'Exactly 2 salary IDs required' });
  }

  const salaries = await prisma.salary.findMany({
    where: { id: { in: idList } },
  });

  if (salaries.length !== 2) {
    return res.status(404).json({ error: 'One or both salary records not found' });
  }

  // Preserve the order the caller requested
  const a = salaries.find((s) => s.id === idList[0])!;
  const b = salaries.find((s) => s.id === idList[1])!;

  const pick = (s: typeof a) => ({
    id: s.id,
    company: s.company,
    role: s.role,
    level: s.level,
    location: s.location,
    experience_years: s.experience_years,
    base_salary: s.base_salary,
    bonus: s.bonus,
    stock: s.stock,
    total_compensation: s.total_compensation,
  });

  return res.json({
    salary_a: pick(a),
    salary_b: pick(b),
    comparison: {
      base_diff: Math.round((a.base_salary - b.base_salary) * 100) / 100,
      bonus_diff: Math.round((a.bonus - b.bonus) * 100) / 100,
      stock_diff: Math.round((a.stock - b.stock) * 100) / 100,
      total_diff: Math.round((a.total_compensation - b.total_compensation) * 100) / 100,
      level_difference: levelDiffLabel(a, b),
    },
  });
});

export default router;
