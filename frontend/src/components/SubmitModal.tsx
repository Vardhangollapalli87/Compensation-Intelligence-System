'use client';

import { useState, FormEvent } from 'react';
import { api } from '@/lib/api';
import { LEVEL_OPTIONS } from './LevelBadge';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const BLANK = {
  company: '',
  role: '',
  level_standardized: '',
  location: '',
  experience_years: '',
  base_salary: '',
  bonus: '',
  stock: '',
};

export function SubmitModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.ingestSalary({
        company: form.company,
        role: form.role,
        level_standardized: form.level_standardized,
        location: form.location,
        experience_years: parseInt(form.experience_years, 10),
        base_salary: parseFloat(form.base_salary),
        bonus: form.bonus ? parseFloat(form.bonus) : 0,
        stock: form.stock ? parseFloat(form.stock) : 0,
        confidence: 0.7,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-white">Submit Your Salary</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *" placeholder="e.g. Google" value={form.company} onChange={set('company')} required />
            <Field label="Role *" placeholder="e.g. Software Engineer" value={form.role} onChange={set('role')} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Level *</label>
              <select
                value={form.level_standardized}
                onChange={set('level_standardized')}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select level</option>
                {LEVEL_OPTIONS.map((l) => <option key={l}>{l}</option>)}
                <option value="SDE-1">SDE-1 (→ L3)</option>
                <option value="SDE-2">SDE-2 (→ L4)</option>
                <option value="SDE-3">SDE-3 (→ L5)</option>
                <option value="Staff Engineer">Staff Engineer (→ L6)</option>
                <option value="Principal">Principal (→ L7)</option>
              </select>
            </div>
            <Field label="Location *" placeholder="e.g. Bangalore" value={form.location} onChange={set('location')} required />
          </div>

          <Field
            label="Years of Experience *"
            placeholder="e.g. 4"
            value={form.experience_years}
            onChange={set('experience_years')}
            type="number"
            min="0"
            required
          />

          <div className="bg-zinc-800/50 rounded-lg p-3 space-y-3">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Compensation (LPA)</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Base Salary *" placeholder="e.g. 30" value={form.base_salary} onChange={set('base_salary')} type="number" min="0" required />
              <Field label="Bonus" placeholder="e.g. 5" value={form.bonus} onChange={set('bonus')} type="number" min="0" />
              <Field label="Stock / ESOP" placeholder="e.g. 10" value={form.stock} onChange={set('stock')} type="number" min="0" />
            </div>
            <p className="text-xs text-zinc-500">All values in Lakhs per annum (LPA). Bonus and stock default to 0.</p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-md border border-zinc-600 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-semibold text-white transition-colors"
            >
              {loading ? 'Submitting…' : 'Submit Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, placeholder, value, onChange, required, type = 'text', min,
}: {
  label: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; type?: string; min?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
