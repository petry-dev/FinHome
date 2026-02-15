import { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/Modal';
import { BtnEditar, BtnExcluir } from '../components/Botoes';

export function PaginaPessoas() {
 const [pessoas, setPessoas] = useState<any[]>([]);
 const [modalAberto, setModalAberto] = useState(false);
 const [editando, setEditando] = useState<any>(null);
 const [nome, setNome] = useState('');
 const [idade, setIdade] = useState('');

 function carregar() { api.get('/pessoas').then(res => setPessoas(res.data)); }
 useEffect(() => { carregar(); }, []);

 function abrirNovo() { setEditando(null); setNome(''); setIdade(''); setModalAberto(true); }

 function abrirEditar(p: any) { setEditando(p); setNome(p.nome); setIdade(p.idade); setModalAberto(true); }

 async function salvar(e: any) {
  e.preventDefault();
  const payload = { nome, idade: parseInt(idade) };
  if (editando) await api.put(`/pessoas/${editando.id}`, { ...payload, id: editando.id });
  else await api.post('/pessoas', payload);
  setModalAberto(false); carregar();
 }

 async function deletar(id: number) {
  if (confirm("Apagar pessoa e suas transações?")) {
   await api.delete(`/pessoas/${id}`); carregar();
  }
 }

 return (
  <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
   <div className="card">
    <h2>
     Gerenciar Pessoas
     <button onClick={abrirNovo} className="btn-novo">+ Nova Pessoa</button>
    </h2>
    <div className="card-body">
     <table>
      <thead>
       <tr>
        <th>Nome</th>
        <th>Idade</th>
        <th style={{ textAlign: 'right' }}>Ações</th>
       </tr>
      </thead>
      <tbody>
       {pessoas.map(p => (
        <tr key={p.id}>
         <td style={{ fontWeight: '500' }}>{p.nome}</td>
         <td>{p.idade} anos</td>
         <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
          <BtnEditar onClick={() => abrirEditar(p)} />
          <BtnExcluir onClick={() => deletar(p.id)} />
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>

   <Modal isOpen={modalAberto} title={editando ? "Editar Pessoa" : "Nova Pessoa"} onClose={() => setModalAberto(false)}>
    <form onSubmit={salvar}>
     <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} maxLength={200} />
     <input placeholder="Idade" type="number" value={idade} onChange={e => setIdade(e.target.value)} />
     <button type="submit" className="btn-novo" style={{ width: '100%', marginTop: '10px' }}>Salvar</button>
    </form>
   </Modal>
  </div>
 );
}