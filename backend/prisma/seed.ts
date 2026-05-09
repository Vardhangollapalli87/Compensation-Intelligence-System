import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const entries = [
  // ── Google India ──────────────────────────────────────────────────────────
  { company: 'google', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 32, bonus: 5, stock: 14, confidence_score: 0.9 },
  { company: 'google', role: 'Software Engineer', level: 'L3', location: 'Hyderabad', experience_years: 1, base_salary: 30, bonus: 4, stock: 12, confidence_score: 0.85 },
  { company: 'google', role: 'Data Engineer',     level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 34, bonus: 5, stock: 15, confidence_score: 0.8 },
  { company: 'google', role: 'Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 5, base_salary: 58, bonus: 11, stock: 28, confidence_score: 0.9 },
  { company: 'google', role: 'ML Engineer',       level: 'L4', location: 'Bangalore', experience_years: 6, base_salary: 62, bonus: 12, stock: 32, confidence_score: 0.85 },
  { company: 'google', role: 'Software Engineer', level: 'L4', location: 'Hyderabad', experience_years: 5, base_salary: 55, bonus: 10, stock: 26, confidence_score: 0.88 },
  { company: 'google', role: 'Staff SWE',         level: 'L5', location: 'Bangalore', experience_years: 9, base_salary: 88, bonus: 18, stock: 48, confidence_score: 0.9 },
  { company: 'google', role: 'Senior SWE',        level: 'L5', location: 'Bangalore', experience_years: 8, base_salary: 82, bonus: 16, stock: 44, confidence_score: 0.85 },

  // ── Microsoft India ───────────────────────────────────────────────────────
  { company: 'microsoft', role: 'Software Engineer 2', level: 'L3', location: 'Hyderabad', experience_years: 3, base_salary: 28, bonus: 4, stock: 10, confidence_score: 0.9 },
  { company: 'microsoft', role: 'Software Engineer 2', level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 30, bonus: 4, stock: 11, confidence_score: 0.85 },
  { company: 'microsoft', role: 'Data Scientist',      level: 'L3', location: 'Hyderabad', experience_years: 3, base_salary: 29, bonus: 4, stock: 10, confidence_score: 0.8 },
  { company: 'microsoft', role: 'Senior SWE',          level: 'L4', location: 'Hyderabad', experience_years: 6, base_salary: 48, bonus: 8, stock: 22, confidence_score: 0.9 },
  { company: 'microsoft', role: 'Senior SWE',          level: 'L4', location: 'Bangalore', experience_years: 7, base_salary: 52, bonus: 9, stock: 24, confidence_score: 0.85 },
  { company: 'microsoft', role: 'Principal Engineer',  level: 'L5', location: 'Hyderabad', experience_years: 10, base_salary: 78, bonus: 14, stock: 38, confidence_score: 0.9 },
  { company: 'microsoft', role: 'Senior SWE',          level: 'L5', location: 'Hyderabad', experience_years: 9, base_salary: 72, bonus: 13, stock: 35, confidence_score: 0.85 },

  // ── Flipkart ─────────────────────────────────────────────────────────────
  { company: 'flipkart', role: 'SDE-2',        level: 'L3', location: 'Bangalore', experience_years: 3, base_salary: 24, bonus: 3, stock: 7,  confidence_score: 0.85 },
  { company: 'flipkart', role: 'SDE-2',        level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 22, bonus: 3, stock: 6,  confidence_score: 0.8 },
  { company: 'flipkart', role: 'Data Engineer',level: 'L3', location: 'Bangalore', experience_years: 3, base_salary: 26, bonus: 4, stock: 8,  confidence_score: 0.75 },
  { company: 'flipkart', role: 'SDE-3',        level: 'L4', location: 'Bangalore', experience_years: 6, base_salary: 42, bonus: 7, stock: 15, confidence_score: 0.85 },
  { company: 'flipkart', role: 'Senior SDE',   level: 'L4', location: 'Bangalore', experience_years: 7, base_salary: 45, bonus: 7, stock: 16, confidence_score: 0.8 },
  { company: 'flipkart', role: 'Staff SDE',    level: 'L5', location: 'Bangalore', experience_years: 10, base_salary: 68, bonus: 12, stock: 26, confidence_score: 0.85 },

  // ── Swiggy ───────────────────────────────────────────────────────────────
  { company: 'swiggy', role: 'Software Engineer', level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 22, bonus: 2, stock: 6,  confidence_score: 0.8 },
  { company: 'swiggy', role: 'Backend Engineer',  level: 'L3', location: 'Bangalore', experience_years: 3, base_salary: 24, bonus: 3, stock: 7,  confidence_score: 0.75 },
  { company: 'swiggy', role: 'Senior Engineer',   level: 'L4', location: 'Bangalore', experience_years: 6, base_salary: 40, bonus: 6, stock: 14, confidence_score: 0.85 },
  { company: 'swiggy', role: 'Senior Engineer',   level: 'L4', location: 'Bangalore', experience_years: 5, base_salary: 38, bonus: 6, stock: 12, confidence_score: 0.8 },
  { company: 'swiggy', role: 'Staff Engineer',    level: 'L5', location: 'Bangalore', experience_years: 9, base_salary: 62, bonus: 10, stock: 22, confidence_score: 0.85 },

  // ── Razorpay ─────────────────────────────────────────────────────────────
  { company: 'razorpay', role: 'SDE-2',      level: 'L3', location: 'Bangalore', experience_years: 3, base_salary: 26, bonus: 3, stock: 8,  confidence_score: 0.85 },
  { company: 'razorpay', role: 'SDE-2',      level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 24, bonus: 3, stock: 7,  confidence_score: 0.8 },
  { company: 'razorpay', role: 'Senior SDE', level: 'L4', location: 'Bangalore', experience_years: 5, base_salary: 44, bonus: 7, stock: 15, confidence_score: 0.85 },
  { company: 'razorpay', role: 'Senior SDE', level: 'L4', location: 'Bangalore', experience_years: 6, base_salary: 46, bonus: 7, stock: 16, confidence_score: 0.8 },
  { company: 'razorpay', role: 'Staff SDE',  level: 'L5', location: 'Bangalore', experience_years: 8, base_salary: 70, bonus: 12, stock: 25, confidence_score: 0.85 },

  // ── CRED ─────────────────────────────────────────────────────────────────
  { company: 'cred', role: 'Software Engineer',        level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 30, bonus: 4, stock: 12, confidence_score: 0.85 },
  { company: 'cred', role: 'Senior Software Engineer', level: 'L4', location: 'Bangalore', experience_years: 5, base_salary: 52, bonus: 9, stock: 22, confidence_score: 0.85 },
  { company: 'cred', role: 'Staff Engineer',           level: 'L5', location: 'Bangalore', experience_years: 8, base_salary: 82, bonus: 15, stock: 35, confidence_score: 0.85 },

  // ── PhonePe ──────────────────────────────────────────────────────────────
  { company: 'phonepe', role: 'SDE-2',      level: 'L3', location: 'Bangalore', experience_years: 3, base_salary: 24, bonus: 3, stock: 7,  confidence_score: 0.8 },
  { company: 'phonepe', role: 'SDE-2',      level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 22, bonus: 2, stock: 6,  confidence_score: 0.75 },
  { company: 'phonepe', role: 'Senior SDE', level: 'L4', location: 'Bangalore', experience_years: 6, base_salary: 42, bonus: 7, stock: 14, confidence_score: 0.8 },
  { company: 'phonepe', role: 'Staff SDE',  level: 'L5', location: 'Bangalore', experience_years: 9, base_salary: 66, bonus: 11, stock: 22, confidence_score: 0.8 },

  // ── Meesho ───────────────────────────────────────────────────────────────
  { company: 'meesho', role: 'SDE-2',      level: 'L3', location: 'Bangalore', experience_years: 2, base_salary: 20, bonus: 2, stock: 5,  confidence_score: 0.75 },
  { company: 'meesho', role: 'Senior SDE', level: 'L4', location: 'Bangalore', experience_years: 5, base_salary: 36, bonus: 5, stock: 10, confidence_score: 0.8 },
  { company: 'meesho', role: 'Staff SDE',  level: 'L5', location: 'Bangalore', experience_years: 8, base_salary: 58, bonus: 9, stock: 18, confidence_score: 0.8 },

  // ── Zepto ────────────────────────────────────────────────────────────────
  { company: 'zepto', role: 'Software Engineer', level: 'L3', location: 'Mumbai', experience_years: 2, base_salary: 26, bonus: 3, stock: 9,  confidence_score: 0.8 },
  { company: 'zepto', role: 'Senior Engineer',   level: 'L4', location: 'Mumbai', experience_years: 5, base_salary: 46, bonus: 8, stock: 18, confidence_score: 0.8 },

  // ── Paytm ────────────────────────────────────────────────────────────────
  { company: 'paytm', role: 'SDE-2',      level: 'L3', location: 'Noida', experience_years: 3, base_salary: 18, bonus: 2, stock: 4,  confidence_score: 0.75 },
  { company: 'paytm', role: 'Senior SDE', level: 'L4', location: 'Noida', experience_years: 5, base_salary: 30, bonus: 4, stock: 8,  confidence_score: 0.75 },
  { company: 'paytm', role: 'Staff SDE',  level: 'L5', location: 'Noida', experience_years: 8, base_salary: 50, bonus: 8, stock: 15, confidence_score: 0.75 },
];

async function main() {
  console.log('Seeding database...');
  await prisma.salary.deleteMany();

  for (const entry of entries) {
    await prisma.salary.create({
      data: {
        ...entry,
        total_compensation: entry.base_salary + entry.bonus + entry.stock,
      },
    });
  }

  console.log(`Seeded ${entries.length} salary entries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
