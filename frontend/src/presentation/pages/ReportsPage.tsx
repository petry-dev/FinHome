'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { fetchReportByPerson } from '@/infrastructure/api/reports'

interface PersonReport { name: string; totalIncome: number; totalExpense: number; balance: number; }
interface ReportSummary {
  details: PersonReport[]
  grandTotalIncome: number
  grandTotalExpense: number
  grandBalance: number
}

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const AVATAR_COLORS = ['#2f9e44','#1f6fb8','#e08a1e','#9b6bd1','#d1492f','#0891b2']

function Avatar({ name, idx }: { name: string; idx: number }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <span className="fh-avatar" style={{ width: 34, height: 34, fontSize: 13, background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
      {initials}
    </span>
  )
}

function SummaryCard({ label, value, icon: Icon, color, soft }: {
  label: string; value: string; icon: typeof Wallet; color: string; soft: string;
}) {
  return (
    <div className="fh-card fh-card-pad" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon size={19} color={color} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</div>
      </div>
      <div className="fh-num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: -.4, marginTop: 12 }}>{value}</div>
    </div>
  )
}

export function ReportsPage() {
  const [data, setData]           = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchReportByPerson()
      .then(res => setData(res))
      .catch(() => setError('Não foi possível carregar o relatório. Tente novamente.'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return (
    <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
      <Loader2 size={28} color="var(--green)" className="fh-spin" />
    </div>
  )

  if (error) return (
    <div className="fh-card">
      <div className="fh-empty">
        <div className="fh-empty-ico error" />
        <h3>Erro ao carregar</h3>
        <p>{error}</p>
        <button className="fh-btn fh-btn-secondary" onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* KPI summary */}
      <div className="fh-kpis">
        <SummaryCard label="Saldo total" value={fmtBRL(data.grandBalance)}
          icon={Wallet} color="var(--blue)" soft="var(--blue-soft)" />
        <SummaryCard label="Total de receitas" value={fmtBRL(data.grandTotalIncome)}
          icon={TrendingUp} color="var(--green)" soft="var(--green-soft)" />
        <SummaryCard label="Total de despesas" value={fmtBRL(data.grandTotalExpense)}
          icon={TrendingDown} color="var(--neg)" soft="var(--neg-soft)" />
      </div>

      {/* Per-person table */}
      <div className="fh-card">
        <div className="fh-card-head">
          <span className="fh-card-title">Por pessoa</span>
        </div>
        {data.details.length === 0 ? (
          <div className="fh-empty">
            <div className="fh-empty-ico" />
            <h3>Sem dados ainda</h3>
            <p>Lance transações para ver o relatório consolidado por pessoa.</p>
          </div>
        ) : (
          <table className="fh-table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th style={{ textAlign: 'right' }}>Receitas</th>
                <th style={{ textAlign: 'right' }}>Despesas</th>
                <th style={{ textAlign: 'right' }}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.details.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={item.name} idx={i} />
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="fh-num" style={{ color: 'var(--pos)', fontWeight: 700 }}>
                      {fmtBRL(item.totalIncome)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="fh-num" style={{ color: 'var(--neg)', fontWeight: 700 }}>
                      {fmtBRL(item.totalExpense)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="fh-num" style={{
                      fontWeight: 700,
                      color: item.balance >= 0 ? 'var(--blue)' : 'var(--neg)',
                    }}>
                      {fmtBRL(item.balance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--line)', background: 'var(--surface-2)' }}>
                <td style={{ padding: '14px 22px', fontWeight: 700, fontSize: 13 }}>Total geral</td>
                <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                  <span className="fh-num" style={{ color: 'var(--pos)', fontWeight: 700 }}>{fmtBRL(data.grandTotalIncome)}</span>
                </td>
                <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                  <span className="fh-num" style={{ color: 'var(--neg)', fontWeight: 700 }}>{fmtBRL(data.grandTotalExpense)}</span>
                </td>
                <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                  <span className="fh-num" style={{ fontWeight: 700, color: data.grandBalance >= 0 ? 'var(--blue)' : 'var(--neg)' }}>
                    {fmtBRL(data.grandBalance)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
