export interface Salary {
  id: string;
  company: string;
  role: string;
  level: string;
  location: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  confidence_score: number;
  submitted_at: string;
}

export interface SalaryResponse {
  data: Salary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CompanyStats {
  company: string;
  salaries: Salary[];
  stats: {
    median_compensation: number;
    median_base: number;
    total_entries: number;
    level_distribution: Record<string, number>;
  };
}

export interface CompanyListItem {
  company: string;
  count: number;
  avg_total_compensation: number;
}

export interface CompareResult {
  salary_a: Omit<Salary, 'confidence_score' | 'submitted_at'>;
  salary_b: Omit<Salary, 'confidence_score' | 'submitted_at'>;
  comparison: {
    base_diff: number;
    bonus_diff: number;
    stock_diff: number;
    total_diff: number;
    level_difference: string;
  };
}

export interface SalaryFilters {
  company?: string;
  role?: string;
  level?: string;
  location?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
