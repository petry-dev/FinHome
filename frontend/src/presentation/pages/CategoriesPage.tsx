'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import apiClient, { parseProblemDetail } from '@/infrastructure/api/client'
import { Modal } from '@/presentation/components/Modal'
import { EditButton, DeleteButton } from '@/presentation/components/Buttons'
import { toast } from '@/hooks/useToast'
import { useAction } from '@/presentation/contexts/ActionContext'

interface Category { id: number; name: string; purpose: number; }

const PURPOSE: Record<number, { label: string; cls: string }> = {
  0: { label: 'Despesa', cls: 'fh-badge-red'    },
  1: { label: 'Receita', cls: 'fh-badge-green'  },
  2: { label: 'Ambas',   cls: 'fh-badge-blue'   },
}

export function CategoriesPage() {
  const { trigger } = useAction()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing]       = useState<Category | null>(null)
  const [name, setName]             = useState('')
  const [purpose, setPurpose]       = useState('0')
  const [isSaving, setIsSaving]     = useState(false)
  const [error, setError]           = useState<string | null>(null)

  function load() {
    setIsLoading(true)
    apiClient.get('/api/categories?pageSize=100')
      .then(res => setCategories(res.data.items))
      .finally(() => setIsLoading(false))
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (trigger) openNew()
  }, [trigger])

  function openNew()           { setEditing(null); setName(''); setPurpose('0'); setError(null); setIsModalOpen(true) }
  function openEdit(c: Category){ setEditing(c); setName(c.name); setPurpose(c.purpose.toString()); setError(null); setIsModalOpen(true) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Nome é obrigatório.'); return }

    setIsSaving(true); setError(null)
    try {
      const payload = { name: name.trim(), purpose: parseInt(purpose) }
      if (editing) {
        await apiClient.put(`/api/categories/${editing.id}`, payload)
        toast({ tone: 'success', title: 'Categoria atualizada', message: name })
      } else {
        await apiClient.post('/api/categories', payload)
        toast({ tone: 'success', title: 'Categoria criada', message: name })
      }
      setIsModalOpen(false)
      load()
    } catch (err) {
      setError(parseProblemDetail(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(c: Category) {
    if (!confirm(`Excluir categoria "${c.name}"?`)) return
    try {
      await apiClient.delete(`/api/categories/${c.id}`)
      toast({ tone: 'info', title: 'Categoria excluída', message: c.name })
      load()
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao excluir', message: parseProblemDetail(err) })
    }
  }

  return (
    <>
      <div className="fh-card">
        <div className="fh-card-head">
          <span className="fh-card-title">Categorias</span>
          <span style={{ fontSize: 13, color: 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)', padding: '2px 10px' }}>
            {categories.length}
          </span>
          <button className="fh-btn fh-btn-primary fh-btn-sm" style={{ marginLeft: 'auto' }} onClick={openNew}>
            + Nova categoria
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={24} color="var(--green)" className="fh-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="fh-empty">
            <div className="fh-empty-ico" />
            <h3>Nenhuma categoria cadastrada</h3>
            <p>Crie categorias para classificar as transações da casa.</p>
            <button className="fh-btn fh-btn-primary" onClick={openNew}>Nova categoria</button>
          </div>
        ) : (
          <table className="fh-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Finalidade</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => {
                const p = PURPOSE[c.purpose] ?? PURPOSE[2]
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className={`fh-badge ${p.cls}`}>{p.label}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <EditButton onClick={() => openEdit(c)} />
                        <DeleteButton onClick={() => handleDelete(c)} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} title={editing ? 'Editar categoria' : 'Nova categoria'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="fh-form-grid">
          {error && (
            <div className="fh-error-banner">
              <AlertCircle size={16} color="var(--neg)" style={{ flex: 'none', marginTop: 1 }} />
              {error}
            </div>
          )}
          <div className="fh-field">
            <label className="fh-label">Nome</label>
            <input className={`fh-input${error && !name.trim() ? ' error' : ''}`}
              placeholder="Ex: Mercado, Salário…" value={name}
              onChange={e => setName(e.target.value)} maxLength={400} />
          </div>
          <div className="fh-field">
            <label className="fh-label">Finalidade</label>
            <div style={{ position: 'relative' }}>
              <select className="fh-select" value={purpose} onChange={e => setPurpose(e.target.value)}>
                <option value="0">Despesa</option>
                <option value="1">Receita</option>
                <option value="2">Ambas</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" className="fh-btn fh-btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="fh-btn fh-btn-primary" style={{ flex: 1 }} disabled={isSaving}>
              {isSaving ? <><Loader2 size={16} className="fh-spin" /> Salvando…</> : (editing ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
