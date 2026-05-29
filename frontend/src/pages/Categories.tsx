import { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/Modal';
import { EditButton, DeleteButton } from '../components/Buttons';
import { parseProblemDetail } from '../services/api';

interface Category { id: number; name: string; purpose: number; }

const PURPOSE_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Expense', color: '#e55039', bg: '#ffebee' },
  1: { label: 'Income',  color: '#00b894', bg: '#e0f2f1' },
  2: { label: 'Both',    color: '#8257e5', bg: '#f3e5f5' },
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get('/api/categories?pageSize=100').then(res => setCategories(res.data.items));
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setName(''); setPurpose('0'); setError(null); setIsModalOpen(true); }
  function openEdit(c: Category) { setEditing(c); setName(c.name); setPurpose(c.purpose.toString()); setError(null); setIsModalOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }

    setIsLoading(true);
    setError(null);
    try {
      const payload = { name: name.trim(), purpose: parseInt(purpose) };
      if (editing) await api.put(`/api/categories/${editing.id}`, payload);
      else await api.post('/api/categories', payload);
      setIsModalOpen(false);
      load();
    } catch (err) {
      setError(parseProblemDetail(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Delete category?')) {
      try {
        await api.delete(`/api/categories/${id}`);
        load();
      } catch (err) {
        alert(parseProblemDetail(err));
      }
    }
  }

  function PurposeBadge({ value }: { value: number }) {
    const p = PURPOSE_LABELS[value] ?? PURPOSE_LABELS[2];
    return (
      <span style={{ color: p.color, background: p.bg, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
        {p.label}
      </span>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card">
        <h2>
          Categories
          <button onClick={openNew} className="btn-novo">+ New Category</button>
        </h2>
        <div className="card-body">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Purpose</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '500' }}>{c.name}</td>
                  <td><PurposeBadge value={c.purpose} /></td>
                  <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
                    <EditButton onClick={() => openEdit(c)} />
                    <DeleteButton onClick={() => handleDelete(c.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} title={editing ? 'Edit Category' : 'New Category'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '10px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} maxLength={400} />
          <select value={purpose} onChange={e => setPurpose(e.target.value)}>
            <option value="0">Expense</option>
            <option value="1">Income</option>
            <option value="2">Both</option>
          </select>
          <button type="submit" className="btn-novo" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
