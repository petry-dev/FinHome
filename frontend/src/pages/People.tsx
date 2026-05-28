import { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/Modal';
import { EditButton, DeleteButton } from '../components/Buttons';

interface Person { id: number; name: string; age: number; }

export function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  function load() {
    api.get('/api/people?pageSize=100').then(res => setPeople(res.data.items));
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setName(''); setAge(''); setIsModalOpen(true); }
  function openEdit(p: Person) { setEditing(p); setName(p.name); setAge(p.age.toString()); setIsModalOpen(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name, age: parseInt(age) };
    if (editing) await api.put(`/api/people/${editing.id}`, payload);
    else await api.post('/api/people', payload);
    setIsModalOpen(false);
    load();
  }

  async function handleDelete(id: number) {
    if (confirm('Delete person and all their transactions?')) {
      await api.delete(`/api/people/${id}`);
      load();
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
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} maxLength={200} />
          <input placeholder="Age" type="number" value={age} onChange={e => setAge(e.target.value)} />
          <button type="submit" className="btn-novo" style={{ width: '100%', marginTop: '10px' }}>Save</button>
        </form>
      </Modal>
    </div>
  );
}
