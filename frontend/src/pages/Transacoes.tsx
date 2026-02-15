import { useState } from 'react';
import { ListaTransacoes } from '../components/ListaTransacoes';
import { FormularioTransacao } from '../components/FormularioTransacao';
import { Modal } from '../components/Modal';
import api from '../services/api';

export interface Transacao {
 id: number;
 descricao: string;
 valor: number;
 tipo: number;
 data: string;
 pessoaId: number;
 categoriaId: number;
 pessoa?: { nome: string };
 categoria?: { nome: string };
}

export function PaginaTransacoes() {
 const [modalFormAberto, setModalFormAberto] = useState(false);
 const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
 const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null);
 const [transacaoExcluindo, setTransacaoExcluindo] = useState<Transacao | null>(null);
 const [atualizarLista, setAtualizarLista] = useState(0);

 function abrirNovaTransacao() {
  setTransacaoEditando(null);
  setModalFormAberto(true);
 }

 function abrirEditar(t: Transacao) {
  setTransacaoEditando(t);
  setModalFormAberto(true);
 }

 function abrirExcluir(t: Transacao) {
  setTransacaoExcluindo(t);
  setModalDeleteAberto(true);
 }

 async function confirmarExclusao() {
  if (transacaoExcluindo) {
   try {
    await api.delete(`/transacoes/${transacaoExcluindo.id}`);
    setAtualizarLista(prev => prev + 1);
    setModalDeleteAberto(false);
   } catch (error) {
    alert("Erro ao excluir");
   }
  }
 }

 return (
  <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
   
   <div className="card">
    <h2>
     Transações
     <button onClick={abrirNovaTransacao} className="btn-novo">+ Nova Transação</button>
    </h2>
    
    <ListaTransacoes 
     aoEditar={abrirEditar}
     aoExcluirSolicitado={abrirExcluir}
     gatilhoAtualizacao={atualizarLista}
    />
   </div>

   <Modal 
    isOpen={modalFormAberto} 
    title={transacaoEditando ? "Editar Transação" : "Nova Transação"} 
    onClose={() => setModalFormAberto(false)}
   >
    <FormularioTransacao 
     transacaoAtual={transacaoEditando}
     onClose={() => setModalFormAberto(false)}
     aoSalvar={() => setAtualizarLista(prev => prev + 1)}
    />
   </Modal>

   <Modal 
    isOpen={modalDeleteAberto} 
    title="Excluir Transação" 
    onClose={() => setModalDeleteAberto(false)}
   >
    <p style={{ marginBottom: '20px', color: '#555' }}>
     Confirma a exclusão de <strong>{transacaoExcluindo?.descricao}</strong>?
    </p>
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
     <button onClick={() => setModalDeleteAberto(false)} style={{ width: 'auto', background: '#ccc', color: '#333' }}>Cancelar</button>
     <button onClick={confirmarExclusao} style={{ width: 'auto', background: '#e55039' }}>Confirmar Exclusão</button>
    </div>
   </Modal>
  </div>
 );
}