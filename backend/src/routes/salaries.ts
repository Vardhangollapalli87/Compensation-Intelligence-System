import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { normalizeCompany, normalizeLevel, computeTotal } from '../utils/normalize';

const router = Router();

const IngestSchema = z.object({
  company: z.string().min(1, 'Company is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  level_standardized: z.string().min(1, 'Level is required'),
  location: z.string().min(1, 'Location is required').max(100),
  experience_years: z.number({ invalid_type_error: 'experience_years must be a number' }).int().min(0).max(50),
  base_salary: z.number({ invalid_type_error: 'base_salary must be a number' }).positive('Base salary must be positive'),
  bonus: z.number().min(0).default(0),
  stock: z.number().min(0).default(0),
  confidence: z.number().min(0).max(1).default(0.5),
});

// POST /ingest-salary
router.post('/ingest-salary', async (req: Request, res: Response) => {
  const parsed = IngestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const data = parsed.data;

  const company = normalizeCompany(data.company);
  const level = normalizeLevel(data.level_standardized);

  if (!level) {
    return res.status(400).json({
      error: 'Invalid level. Use L3–L8 or aliases: SDE-1, SDE-2, SDE-3, Staff Engineer, Principal, etc.',
    });
  }

  const bonus = data.bonus ?? 0;
  const stock = data.stock ?? 0;
  const total_compensation = computeTotal(data.base_salary, bonus, stock);

  // Duplicate check — same company + role + level + location + base_salary
  const duplicate = await prisma.salary.findFirst({
    where: {
      company,
      role: { equals: data.role.trim(), mode: 'insensitive' },
      level,
      location: { equals: data.location.trim(), mode: 'insensitive' },
      base_salary: data.base_salary,
    },
  });

  if (duplicate) {
    return res.status(409).json({
      error: 'Duplicate entry. A salary with the same company, role, level, location and base salary already exists.',
    });
  }

  const salary = await prisma.salary.create({
    data: {
      company,
      role: data.role.trim(),
      level,
      location: data.location.trim(),
      experience_years: data.experience_years,
      base_salary: data.base_salary,
      bonus,
      stock,
      total_compensation,
      confidence_score: data.confidence,
    },
  });

  return res.status(201).json(salary);
});

// GET /salaries
router.get('/salaries', async (req: Request, res: Response) => {
  const { company, role, level, location, sort, order, page, limit } = req.query;

  const sortField = ['total_compensation', 'base_salary', 'experience_years', 'submitted_at'].includes(sort as string)
    ? (sort as string)
    : 'total_compensation';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  const pageNum = Math.max(1, parseInt((page as string) ?? '1', 10));
  const limitNum = Math.min(100, Math.max(1, parseInt((limit as string) ?? '20', 10)));

  const where: Record<string, unknown> = {};

  if (company) {
    where.company = { contains: normalizeCompany(company as string), mode: 'insensitive' };
  }
  if (role) {
    where.role = { contains: (role as string).trim(), mode: 'insensitive' };
  }
  if (level) {
    const normalizedLevel = normalizeLevel(level as string);
    where.level = normalizedLevel ?? (level as string).toUpperCase().trim();
  }
  if (location) {
    where.location = { contains: (location as string).trim(), mode: 'insensitive' };
  }

  const [salaries, total] = await Promise.all([
    prisma.salary.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.salary.count({ where }),
  ]);

  return res.json({
    data: salaries,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export default router;
