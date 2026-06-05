'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, Users, Tag, BarChart3,
  Wallet, LogOut, Bell, Plus, UserPlus,
} from 'lucide-react'
import Image from 'next/image'
import logo from '@/assets/logo.png'
import { useToast } from '@/hooks/useToast'
import { Toaster } from '@/presentation/components/Toaster'
import { useAction } from '@/presentation/contexts/ActionContext'

const NAV = [
  { to: '/',              label: 'Dashboard',   Icon: LayoutDashboard },
  { to: '/transactions',  label: 'Transações',  Icon: ArrowLeftRight  },
  { to: '/people',        label: 'Pessoas',     Icon: Users           },
  { to: '/categories',    label: 'Categorias',  Icon: Tag             },
  { to: '/reports',       label: 'Relatórios',  Icon: BarChart3       },
]

const PAGE_META: Record<string, { title: string; sub: string; action?: { label: string; icon: typeof Plus } }> = {
  '/':             { title: 'Dashboard',   sub: 'Resumo das finanças da casa' },
  '/transactions': { title: 'Transações',  sub: 'Lançamentos de receitas e despesas',  action: { label: 'Nova transação', icon: Plus } },
  '/people':       { title: 'Pessoas',     sub: 'Membros da casa',                     action: { label: 'Nova pessoa',    icon: UserPlus } },
  '/categories':   { title: 'Categorias',  sub: 'Classificação dos lançamentos',       action: { label: 'Nova categoria', icon: Plus } },
  '/reports':      { title: 'Relatórios',  sub: 'Consolidação por pessoa e categoria' },
}

interface Props {
  children: React.ReactNode
}

export function MainLayout({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { toasts, removeToast } = useToast()
  const { fire } = useAction()
  const meta = PAGE_META[pathname] ?? PAGE_META['/']

  return (
    <div className="fh-shell">
      {/* Sidebar */}
      <aside className="fh-sidebar">
        <div style={{ padding: '16px 10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image
            src={logo}
            alt="FinHome"
            style={{ height: 56, width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
        </div>

        <nav className="fh-nav">
          {NAV.map(({ to, label, Icon }) => {
            const isActive = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/')
            return (
              <Link
                key={to}
                href={to}
                className={`fh-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={19} color={isActive ? '#8fe3a4' : 'rgba(255,255,255,.5)'} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <div style={{
            background: 'rgba(255,255,255,.08)', borderRadius: 14, padding: 14,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#2f9e44',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13, flex: 'none',
            }}>FH</div>
            <div style={{ minWidth: 0, lineHeight: 1.3, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>FinHome</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>Casa</div>
            </div>
            <button
              title="Sair"
              onClick={() => router.push('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8 }}
            >
              <LogOut size={18} color="rgba(255,255,255,.6)" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="fh-main">
        <header className="fh-topbar">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -.3 }}>{meta.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{meta.sub}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="fh-btn fh-btn-secondary fh-btn-icon"
              aria-label="Notificações"
              style={{ position: 'relative' }}
            >
              <Bell size={18} color="var(--ink-2)" />
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--neg)', border: '1.5px solid var(--surface)',
              }} />
            </button>

            {meta.action && (
              <button className="fh-btn fh-btn-primary" onClick={fire}>
                <meta.action.icon size={17} color="#fff" />
                {meta.action.label}
              </button>
            )}
          </div>
        </header>

        <div className="fh-content">
          {children}
        </div>
      </div>

      <Toaster toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export { Wallet }
