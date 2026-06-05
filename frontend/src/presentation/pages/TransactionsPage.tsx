'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import apiClient, { parseProblemDetail } from '@/infrastructure/api/client'
import { Modal } from '@/presentation/components/Modal'
import { EditButton, DeleteButton } from '@/presentation/components/Buttons'
import { toast } from '@/hooks/useToast'
import { useAction } from '@/presentation/contexts/ActionContext'

export interface Transaction {
  id: number
  description: string
  amount: number
  type: number
  date: string
  personId: number
  categoryId: number
  personName: string
  categoryName: string
}

interface SelectOption { id: number; name: string; }

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

const AVATAR_COLORS = ['#2f9e44','#1f6fb8','#e08a1e','#9b6bd1','#d1492f','#0891b2']

function Avatar({ name, idx }: { name: string; idx: number }) {
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
  return (
    <span className="fh-avatar" style={{ width: 34, height: 34, fontSize: 13, background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
      {initials}
    </span>
  )
}

function TransactionForm({ current, onSave, onClose }: { current: Transaction | null; onSave: () => void; onClose: () => void }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState(() => current
    ? { description: current.description, amount: current.amount.toString(), type: current.type.toString(), personId: current.personId?.toString() || '', categoryId: current.categoryId?.toString() || '', date: current.date.split('T')[0] }
    : { description: '', amount: '', type: '0', personId: '', categoryId: '', date: today }
  )
  const [people, setPeople]       = useState<SelectOption[]>([])
  const [categories, setCategories] = useState<SelectOption[]>([])
  const [isSaving, setIsSaving]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    apiClient.get('/api/people?pageSize=100').then(r => setPeople(r.data.items))
    apiClient.get('/api/categories?pageSize=100').then(r => setCategories(r.data.items))
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount || !form.personId || !form.categoryId) {
      setError('Preencha todos os campos.'); return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) { setError('Valor deve ser maior que zero.'); return }

    setIsSaving(true); setError(null)
    try {
      const payload = {
        description: form.description, amount,
        type: parseInt(form.type),
        personId: parseInt(form.personId),
        categoryId: parseInt(form.categoryId),
        date: new Date(form.date).toISOString(),
      }
      if (current) {
        await apiClient.put(`/api/transactions/${current.id}`, payload)
        toast({ tone: 'success', title: 'Transação atualizada', message: `${form.description} · ${fmtBRL(amount)}` })
      } else {
        await apiClient.post('/api/transactions', payload)
        toast({ tone: 'success', title: 'Transação lançada', message: `${form.description} · ${fmtBRL(amount)}` })
      }
      onSave(); onClose()
    } catch (err) {
      setError(parseProblemDetail(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="fh-form-grid">
      {error && (
        <div className="fh-error-banner">
          <AlertCircle size={16} color="var(--neg)" style={{ flex: 'none', marginTop: 1 }} />
          {error}
        </div>
      )}
      <div className="fh-form-row">
        <div className="fh-field">
          <label className="fh-label">Data</label>
          <input className="fh-input" type="date" value={form.date} onChange={set('date')} />
        </div>
        <div className="fh-field">
          <label className="fh-label">Tipo</label>
          <div style={{ position: 'relative' }}>
            <select className="fh-select" value={form.type} onChange={set('type')}>
              <option value="0">Despesa</option>
              <option value="1">Receita</option>
            </select>
          </div>
        </div>
      </div>
      <div className="fh-field">
        <label className="fh-label">Pessoa</label>
        <div style={{ position: 'relative' }}>
          <select className="fh-select" value={form.personId} onChange={set('personId')}>
            <option value="">Selecione a pessoa</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="fh-field">
        <label className="fh-label">Categoria</label>
        <div style={{ position: 'relative' }}>
          <select className="fh-select" value={form.categoryId} onChange={set('categoryId')}>
            <option value="">Selecione a categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="fh-field">
        <label className="fh-label">Descrição</label>
        <input className="fh-input" placeholder="Ex: Feira do mês" value={form.description} onChange={set('description')} maxLength={400} />
      </div>
      <div className="fh-field">
        <label className="fh-label">Valor (R$)</label>
        <input className="fh-input fh-num" type="number" step="0.01" min="0.01" placeholder="0,00" value={form.amount} onChange={set('amount')} />
      </div>
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button type="button" className="fh-btn fh-btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
        <button type="submit" className="fh-btn fh-btn-primary" style={{ flex: 1 }} disabled={isSaving}>
          {isSaving ? <><Loader2 size={16} className="fh-spin" /> Salvando…</> : (current ? 'Salvar' : 'Lançar')}
        </button>
      </div>
    </form>
  )
}

export function TransactionsPage() {
  const { trigger } = useAction()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [isFormOpen, setIsFormOpen]     = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editing, setEditing]           = useState<Transaction | null>(null)
  const [deleting, setDeleting]         = useState<Transaction | null>(null)
  const [refresh, setRefresh]           = useState(0)

  function load() {
    setIsLoading(true)
    apiClient.get('/api/transactions?pageSize=100')
      .then(res => setTransactions(res.data.items))
      .finally(() => setIsLoading(false))
  }
  useEffect(() => { load() }, [refresh])

  useEffect(() => {
    if (trigger) { setEditing(null); setIsFormOpen(true) }
  }, [trigger])

  // map person names to consistent color indexes
  const personColorMap = new Map<string, number>()
  transactions.forEach(t => {
    if (!personColorMap.has(t.personName)) personColorMap.set(t.personName, personColorMap.size)
  })

  async function confirmDelete() {
    if (!deleting) return
    try {
      await apiClient.delete(`/api/transactions/${deleting.id}`)
      toast({ tone: 'info', title: 'Transação excluída', message: deleting.description })
      setIsDeleteOpen(false)
      setRefresh(r => r + 1)
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao excluir', message: parseProblemDetail(err) })
    }
  }

  return (
    <>
      <div className="fh-card">
        <div className="fh-card-head">
          <span className="fh-card-title">Transações</span>
          <span style={{ fontSize: 13, color: 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)', padding: '2px 10px' }}>
            {transactions.length}
          </span>
          <button className="fh-btn fh-btn-primary fh-btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => { setEditing(null); setIsFormOpen(true) }}>
            + Nova transação
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={24} color="var(--green)" className="fh-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="fh-empty">
            <div className="fh-empty-ico" />
            <h3>Nenhuma transação ainda</h3>
            <p>Comece lançando a primeira receita ou despesa da casa.</p>
            <button className="fh-btn fh-btn-primary" onClick={() => { setEditing(null); setIsFormOpen(true) }}>
              Lançar transação
            </button>
          </div>
        ) : (
          <table className="fh-table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => {
                const colorIdx = personColorMap.get(t.personName) ?? 0
                const isIncome = t.type === 1
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={t.personName || '?'} idx={colorIdx} />
                        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t.personName || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{fmtDate(t.date)}</div>
                    </td>
                    <td>
                      <span className="fh-badge fh-badge-neutral">{t.categoryName || '—'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="fh-num" style={{ fontWeight: 700, color: isIncome ? 'var(--pos)' : 'var(--neg)' }}>
                        {isIncome ? '+ ' : '− '}{fmtBRL(t.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <EditButton onClick={() => { setEditing(t); setIsFormOpen(true) }} />
                        <DeleteButton onClick={() => { setDeleting(t); setIsDeleteOpen(true) }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isFormOpen} title={editing ? 'Editar transação' : 'Nova transação'} onClose={() => setIsFormOpen(false)}>
        <TransactionForm
          current={editing}
          onSave={() => setRefresh(r => r + 1)}
          onClose={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal isOpen={isDeleteOpen} title="Excluir transação" onClose={() => setIsDeleteOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ color: 'var(--ink-2)', margin: 0 }}>
            Tem certeza que deseja excluir <strong style={{ color: 'var(--ink)' }}>{deleting?.description}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="fh-btn fh-btn-secondary" style={{ flex: 1 }} onClick={() => setIsDeleteOpen(false)}>Cancelar</button>
            <button className="fh-btn fh-btn-danger" style={{ flex: 1 }} onClick={confirmDelete}>Excluir</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
