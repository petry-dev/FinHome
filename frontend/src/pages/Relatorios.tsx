import { useEffect, useState } from 'react';
import api from '../services/api';

export function PaginaRelatorios() {
 const [dados, setDados] = useState<any>(null);

 useEffect(() => {
  api.get('/relatorios/por-pessoa')
   .then(res => setDados(res.data))
   .catch(err => console.error("Erro ao carregar relatório", err));
 }, []);

 const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

 if (!dados) {
  return (
   <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
    Carregando dados financeiros...
   </div>
  );
 }

 return (
  <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
   <div className="card">
    <h2>Relatório Consolidado</h2>
    
    <div className="card-body">
     <table>
      <thead>
       <tr>
        <th>Pessoa</th>
        <th style={{ textAlign: 'right' }}>Receitas (+)</th>
        <th style={{ textAlign: 'right' }}>Despesas (-)</th>
        <th style={{ textAlign: 'right' }}>Saldo (=)</th>
       </tr>
      </thead>
      <tbody>
       {dados.detalhado.map((item: any, index: number) => (
        <tr key={index}>
         <td style={{ fontWeight: '500' }}>{item.nome}</td>
         <td style={{ textAlign: 'right', color: 'var(--success)' }}>{fmt(item.totalReceitas)}</td>
         <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{fmt(item.totalDespesas)}</td>
         <td style={{ textAlign: 'right', fontWeight: 'bold', color: item.saldo >= 0 ? '#007bff' : '#e55039' }}>
          {fmt(item.saldo)}
         </td>
        </tr>
       ))}
      </tbody>
      <tfoot style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
       <tr>
        <td style={{ padding: '15px' }}>TOTAL GERAL</td>
        <td style={{ textAlign: 'right', color: 'var(--success)' }}>{fmt(dados.totalizacao.totalReceitas)}</td>
        <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{fmt(dados.totalizacao.totalDespesas)}</td>
        <td style={{ textAlign: 'right', color: dados.totalizacao.saldo >= 0 ? '#007bff' : '#e55039' }}>
         {fmt(dados.totalizacao.saldo)}
        </td>
       </tr>
      </tfoot>
     </table>
    </div>
   </div>
  </div>
 );
}