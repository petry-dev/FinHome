import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav style={{ background: '#333', padding: '15px', color: '#fff', display: 'flex', gap: '20px' }}>
      <strong style={{ fontSize: '1.2rem' }}>FinHome</strong>
      
      <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
      <Link to="/pessoas" style={{ color: '#fff', textDecoration: 'none' }}>Pessoas</Link>
      <Link to="/categorias" style={{ color: '#fff', textDecoration: 'none' }}>Categorias</Link>
      <Link to="/transacoes" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#ffd700' }}>Transações ($)</Link>
    </nav>
  );
}