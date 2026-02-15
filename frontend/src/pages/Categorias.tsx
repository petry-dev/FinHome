import { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/Modal';
import { BtnEditar, BtnExcluir } from '../components/Botoes';

export function PaginaCategorias() {
 const [categorias, setCategorias] = useState<any[]>([]);
 const [modalAberto, setModalAberto] = useState(false);
 const [editando, setEditando] = useState<any>(null);
 const [nome, setNome] = useState('');
 const [finalidade, setFinalidade] = useState('0');

 function carregar() { api.get('/categorias').then(res => setCategorias(res.data)); }
 useEffect(() => { carregar(); }, []);

 function abrirNovo() { setEditando(null); setNome(''); setFinalidade('0'); setModalAberto(true); }
 function abrirEditar(c: any) { setEditando(c); setNome(c.nome); setFinalidade(c.finalidade.toString()); setModalAberto(true); }

 async function salvar(e: any) {
  e.preventDefault();
  const payload = { nome, finalidade: parseInt(finalidade) };
  if (editando) await api.put(`/categorias/${editando.id}`, { ...payload, id: editando.id });
  else await api.post('/categorias', payload);
  setModalAberto(false); carregar();
 }

 async function deletar(id: number) {
  if (confirm("Excluir categoria?")) { await api.delete(`/categorias/${id}`); carregar(); }
 }

 function getBadge(tipo: number) {
  if (tipo === 0) return <span style={{ color: '#e55039', background: '#ffebee', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Despesa</span>;
  if (tipo === 1) return <span style={{ color: '#00b894', background: '#e0f2f1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Receita</span>;
  return <span style={{ color: '#8257e5', background: '#f3e5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Ambas</span>;
 }

 return (
  <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
   <div className="card">
    <h2>
     Categorias
     <button onClick={abrirNovo} className="btn-novo">+ Nova Categoria</button>
    </h2>
    <div className="card-body">
     <table>
      <thead>
       <tr>
        <th>Nome</th>
        <th>Finalidade</th>
        <th style={{ textAlign: 'right' }}>Ações</th>
       </tr>
      </thead>
      <tbody>
       {categorias.map(c => (
        <tr key={c.id}>
         <td style={{ fontWeight: '500' }}>{c.nome}</td>
         <td>{getBadge(c.finalidade)}</td>
         <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
          <BtnEditar onClick={() => abrirEditar(c)} />
          <BtnExcluir onClick={() => deletar(c.id)} />
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>

   <Modal isOpen={modalAberto} title={editando ? "Editar" : "Nova"} onClose={() => setModalAberto(false)}>
    <form onSubmit={salvar}>
     <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} maxLength={400} />
     <select value={finalidade} onChange={e => setFinalidade(e.target.value)}>
      <option value="0">Despesa</option>
      <option value="1">Receita</option>
      <option value="2">Ambas</option>
     </select>
     <button type="submit" className="btn-novo" style={{ width: '100%', marginTop: '10px' }}>Salvar</button>
    </form>
   </Modal>
  </div>
 );
}