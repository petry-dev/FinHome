'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, Users, Tag } from 'lucide-react'
import { fetchReportByPerson } from '@/infrastructure/api/reports'

interface Summary {
  grandTotalIncome: number
  grandTotalExpense: number
  grandBalance: number
}

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function KpiCard({
  label, value, icon: Icon, tint, tintSoft, trend,
}: {
  label: string; value: string; icon: typeof Wallet;
  tint: string; tintSoft: string; trend?: string;
}) {
  return (
    <div className="fh-card fh-card-pad fh-kpi-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: tintSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon size={20} color={tint} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</div>
      </div>
      <div className="fh-num" style={{ fontSize: 29, fontWeight: 700, letterSpacing: -.5, marginTop: 14, color: 'var(--ink)' }}>{value}</div>
      {trend && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 6 }}>{trend}</div>}
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, color }: { to: string; icon: typeof Wallet; label: string; color: string }) {
  const router = useRouter()
  return (
    <button
      className="fh-card fh-card-pad"
      onClick={() => router.push(to)}
      style={{ flex: 1, cursor: 'pointer', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12, transition: 'box-shadow var(--dur)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--sh-lg)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--sh)')}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <Icon size={20} color={color} />
      </div>
      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{label}</span>
    </button>
  )
}

export function HomePage() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    fetchReportByPerson()
      .then(data => setSummary(data))
      .catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: -.4 }}>Olá 👋</h1>
        <p style={{ color: 'var(--ink-3)', marginTop: 4 }}>Aqui está o resumo das finanças da casa.</p>
      </div>

      {summary && (
        <div className="fh-kpis">
          <KpiCard label="Saldo consolidado" value={fmtBRL(summary.grandBalance)}
            icon={Wallet} tint="var(--blue)" tintSoft="var(--blue-soft)"
            trend={summary.grandBalance >= 0 ? 'No azul 🎉' : 'Atenção ao saldo'} />
          <KpiCard label="Receitas" value={fmtBRL(summary.grandTotalIncome)}
            icon={TrendingUp} tint="var(--green)" tintSoft="var(--green-soft)" />
          <KpiCard label="Despesas" value={fmtBRL(summary.grandTotalExpense)}
            icon={TrendingDown} tint="var(--neg)" tintSoft="var(--neg-soft)" />
        </div>
      )}

      <div className="fh-card fh-card-pad">
        <div className="fh-card-title" style={{ marginBottom: 16 }}>Acesso rápido</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <QuickLink to="/transactions" icon={ArrowLeftRight} label="Transações" color="var(--green)" />
          <QuickLink to="/people"       icon={Users}          label="Pessoas"    color="var(--blue)" />
          <QuickLink to="/categories"   icon={Tag}            label="Categorias" color="var(--amber)" />
        </div>
      </div>
    </div>
  )
}
