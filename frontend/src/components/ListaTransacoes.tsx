import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Transacao } from '../pages/Transacoes';
import { BtnEditar, BtnExcluir } from './Botoes';

interface Props {
 aoEditar: (t: Transacao) => void;
 aoExcluirSolicitado: (t: Transacao) => void;
 gatilhoAtualizacao: number;
}

export function ListaTransacoes({ aoEditar, aoExcluirSolicitado, gatilhoAtualizacao }: Props) {
 const [transacoes, setTransacoes] = useState<Transacao[]>([]);

 useEffect(() => {
  api.get('/transacoes').then(response => setTransacoes(response.data));
 }, [gatilhoAtualizacao]);

 return (
  <div className="card-body">
   <table>
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
     {transacoes.map(t => (
      <tr key={t.id}>
       <td style={{ fontWeight: '500' }}>{t.pessoa?.nome || '---'}</td>
       <td>
        <div style={{ fontWeight: '500' }}>{t.descricao}</div>
        <small style={{ color: '#999', fontSize: '0.8rem' }}>{new Date(t.data).toLocaleDateString()}</small>
       </td>
       <td>{t.categoria?.nome}</td>
       <td style={{ fontWeight: 'bold', color: t.tipo === 1 ? 'var(--success)' : 'var(--danger)', textAlign: 'right' }}>
        {t.tipo === 1 ? '+ ' : '- '} 
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}
       </td>
       <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
        <BtnEditar onClick={() => aoEditar(t)} />
        <BtnExcluir onClick={() => aoExcluirSolicitado(t)} />
       </td>
      </tr>
     ))}
    </tbody>
   </table>
  </div>
 );
}