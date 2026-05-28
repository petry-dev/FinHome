import React, { useState } from 'react';
import api from '../services/api';
import type { Transaction } from '../pages/Transactions';
import { AxiosError } from 'axios';

interface Props {
  currentTransaction: Transaction | null;
  onSave: () => void;
  onClose: () => void;
}

interface SelectOption { id: number; name: string; }

export function TransactionForm({ currentTransaction, onSave, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState(() => {
    if (currentTransaction) {
      return {
        description: currentTransaction.description,
        amount: currentTransaction.amount.toString(),
        type: currentTransaction.type.toString(),
        personId: currentTransaction.personId?.toString() || '',
        categoryId: currentTransaction.categoryId?.toString() || '',
        date: currentTransaction.date.split('T')[0]
      };
    }
    return { description: '', amount: '', type: '0', personId: '', categoryId: '', date: today };
  });

  const [people, setPeople] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);

  React.useEffect(() => {
    api.get('/api/people?pageSize=100').then(res => setPeople(res.data.items));
    api.get('/api/categories?pageSize=100').then(res => setCategories(res.data.items));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.amount || !form.personId || !form.categoryId)
      return alert('Please fill all fields.');

    const payload = {
      description: form.description,
      amount: parseFloat(form.amount),
      type: parseInt(form.type),
      personId: parseInt(form.personId),
      categoryId: parseInt(form.categoryId),
      date: new Date(form.date).toISOString()
    };

    try {
      if (currentTransaction) {
        await api.put(`/api/transactions/${currentTransaction.id}`, payload);
      } else {
        await api.post('/api/transactions', payload);
      }
      onSave();
      onClose();
    } catch (error) {
      const err = error as AxiosError<{ detail?: string; errors?: Record<string, string[]> }>;
      const detail = err.response?.data?.detail;
      const errors = err.response?.data?.errors;
      if (detail) alert(detail);
      else if (errors) alert(Object.values(errors).flat().join('\n'));
      else alert('Error saving transaction. Check the console.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="0">Expense</option>
            <option value="1">Income</option>
          </select>
        </div>
      </div>

      <select name="personId" value={form.personId} onChange={handleChange}>
        <option value="">Who paid / received?</option>
        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <select name="categoryId" value={form.categoryId} onChange={handleChange}>
        <option value="">Select category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <input name="description" placeholder="Description (e.g. Groceries)" value={form.description} onChange={handleChange} />
      <input name="amount" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={handleChange} />

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" style={{ flex: 1, padding: '12px', background: '#8257e5', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {currentTransaction ? 'Save Changes' : 'Create Transaction'}
        </button>
      </div>
    </form>
  );
}
