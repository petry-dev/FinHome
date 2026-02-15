import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: '260px',
        background: '#1a1c23',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
         <img src={logo} alt="FinHome" style={{ maxWidth: '266px', display: 'block', marginLeft: '-41px', marginBottom: '-78px'}} /> 
       </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" className="menu-item">Dashboard</Link>
          <Link to="/transacoes" className="menu-item">Transações</Link>
          <Link to="/pessoas" className="menu-item">Pessoas</Link>
          <Link to="/categorias" className="menu-item">Categorias</Link>
          <Link to="/relatorios" className="menu-item">Relatórios</Link>
        </nav>
        
        <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
          v1.0.0
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {/* Container simples (sem classe .card) para evitar bordas duplas,
            visto que as páginas internas já implementam seus próprios cards.
        */}
        <div style={{ minHeight: '80vh' }}>
          {children}
        </div>
      </main>

      {/* Estilos locais para micro-interações do menu */}
      <style>{`
        .menu-item {
          color: #a0a0a0;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 500;
          display: block;
          transition: all 0.2s ease-in-out;
        }
        .menu-item:hover {
          background: #2e303b;
          color: #fff;
          transform: translateX(5px);
        }
      `}</style>
    </div>
  );
}