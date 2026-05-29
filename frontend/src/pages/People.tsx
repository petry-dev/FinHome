import { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/Modal';
import { EditButton, DeleteButton } from '../components/Buttons';
import { parseProblemDetail } from '../services/api';

interface Person { id: number; name: string; age: number; }

export function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get('/api/people?pageSize=100').then(res => setPeople(res.data.items));
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setName(''); setAge(''); setError(null); setIsModalOpen(true); }
  function openEdit(p: Person) { setEditing(p); setName(p.name); setAge(p.age.toString()); setError(null); setIsModalOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    const parsedAge = parseInt(age);
    if (!age || isNaN(parsedAge) || parsedAge < 0) { setError('Age must be a non-negative number.'); return; }

    setIsLoading(true);
    setError(null);
    try {
      const payload = { name: name.trim(), age: parsedAge };
      if (editing) await api.put(`/api/people/${editing.id}`, payload);
      else await api.post('/api/people', payload);
      setIsModalOpen(false);
      load();
    } catch (err) {
      setError(parseProblemDetail(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Delete person and all their transactions?')) {
      try {
        await api.delete(`/api/people/${id}`);
        load();
      } catch (err) {
        alert(parseProblemDetail(err));
      }
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card">
        <h2>
          People
          <button onClick={openNew} className="btn-novo">+ New Person</button>
        </h2>
        <div className="card-body">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {people.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '500' }}>{p.name}</td>
                  <td>{p.age} years</td>
                  <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
                    <EditButton onClick={() => openEdit(p)} />
                    <DeleteButton onClick={() => handleDelete(p.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} title={editing ? 'Edit Person' : 'New Person'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '10px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} maxLength={200} />
          <input placeholder="Age" type="number" value={age} onChange={e => setAge(e.target.value)} min={0} />
          <button type="submit" className="btn-novo" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
