'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { parseProblemDetail } from '@/infrastructure/api/client'
import { Modal } from '@/presentation/components/Modal'
import { EditButton, DeleteButton } from '@/presentation/components/Buttons'
import { toast } from '@/hooks/useToast'
import { useAction } from '@/presentation/contexts/ActionContext'
import apiClient from '@/infrastructure/api/client'

interface Person { id: number; name: string; age: number; }

const AVATAR_COLORS = ['#2f9e44','#1f6fb8','#e08a1e','#9b6bd1','#d1492f','#0891b2']

function Avatar({ name, idx }: { name: string; idx: number }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <span className="fh-avatar" style={{ width: 36, height: 36, background: AVATAR_COLORS[idx % AVATAR_COLORS.length], fontSize: 14 }}>
      {initials}
    </span>
  )
}

export function PeoplePage() {
  const { trigger } = useAction()
  const [people, setPeople]       = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing]     = useState<Person | null>(null)
  const [name, setName]           = useState('')
  const [age, setAge]             = useState('')
  const [isSaving, setIsSaving]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  function load() {
    setIsLoading(true)
    apiClient.get('/api/people?pageSize=100')
      .then(res => setPeople(res.data.items))
      .finally(() => setIsLoading(false))
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (trigger) openNew()
  }, [trigger])

  function openNew()          { setEditing(null); setName(''); setAge(''); setError(null); setIsModalOpen(true) }
  function openEdit(p: Person){ setEditing(p); setName(p.name); setAge(p.age.toString()); setError(null); setIsModalOpen(true) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Nome é obrigatório.'); return }
    const parsedAge = parseInt(age)
    if (!age || isNaN(parsedAge) || parsedAge <= 0) { setError('Idade deve ser maior que zero.'); return }

    setIsSaving(true); setError(null)
    try {
      if (editing) {
        await apiClient.put(`/api/people/${editing.id}`, { name: name.trim(), age: parsedAge })
        toast({ tone: 'success', title: 'Pessoa atualizada', message: name })
      } else {
        await apiClient.post('/api/people', { name: name.trim(), age: parsedAge })
        toast({ tone: 'success', title: 'Pessoa adicionada', message: name })
      }
      setIsModalOpen(false)
      load()
    } catch (err) {
      setError(parseProblemDetail(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(p: Person) {
    if (!confirm(`Excluir ${p.name} e todas as suas transações?`)) return
    try {
      await apiClient.delete(`/api/people/${p.id}`)
      toast({ tone: 'info', title: 'Pessoa excluída', message: p.name })
      load()
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao excluir', message: parseProblemDetail(err) })
    }
  }

  return (
    <>
      <div className="fh-card">
        <div className="fh-card-head">
          <span className="fh-card-title">Pessoas</span>
          <span style={{ fontSize: 13, color: 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)', padding: '2px 10px' }}>
            {people.length}
          </span>
          <button className="fh-btn fh-btn-primary fh-btn-sm" style={{ marginLeft: 'auto' }} onClick={openNew}>
            + Nova pessoa
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={24} color="var(--green)" className="fh-spin" />
          </div>
        ) : people.length === 0 ? (
          <div className="fh-empty">
            <div className="fh-empty-ico" />
            <h3>Nenhuma pessoa cadastrada</h3>
            <p>Adicione os membros da casa para começar a lançar transações.</p>
            <button className="fh-btn fh-btn-primary" onClick={openNew}>Adicionar pessoa</button>
          </div>
        ) : (
          <table className="fh-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p, i) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={p.name} idx={i} />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`fh-badge fh-badge-${p.age < 18 ? 'amber' : 'neutral'}`}>
                      {p.age} anos{p.age < 18 ? ' · Menor' : ''}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <EditButton onClick={() => openEdit(p)} />
                      <DeleteButton onClick={() => handleDelete(p)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} title={editing ? 'Editar pessoa' : 'Nova pessoa'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="fh-form-grid">
          {error && (
            <div className="fh-error-banner">
              <AlertCircle size={16} color="var(--neg)" style={{ flex: 'none', marginTop: 1 }} />
              {error}
            </div>
          )}
          <div className="fh-field">
            <label className="fh-label">Nome completo</label>
            <input className={`fh-input${error && !name.trim() ? ' error' : ''}`}
              placeholder="Nome da pessoa" value={name} onChange={e => setName(e.target.value)} maxLength={200} />
          </div>
          <div className="fh-field">
            <label className="fh-label">Idade</label>
            <input className="fh-input" type="number" placeholder="Ex: 32" value={age}
              onChange={e => setAge(e.target.value)} min={1} max={120} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" className="fh-btn fh-btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="fh-btn fh-btn-primary" style={{ flex: 1 }} disabled={isSaving}>
              {isSaving ? <><Loader2 size={16} className="fh-spin" /> Salvando…</> : (editing ? 'Salvar' : 'Adicionar')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
