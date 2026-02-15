import React, { useState } from 'react';
import api from '../services/api';
import type { Transacao } from '../pages/Transacoes';
import { AxiosError } from 'axios';

interface Props {
  transacaoAtual: Transacao | null;
  aoSalvar: () => void;
  onClose: () => void;
}

interface ItemOpcao { id: number; nome: string; }

export function FormularioTransacao({ transacaoAtual, aoSalvar, onClose }: Props) {
  const dataHoje = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState(() => {
    if (transacaoAtual) {
      return {
        descricao: transacaoAtual.descricao,
        valor: transacaoAtual.valor.toString(),
        tipo: transacaoAtual.tipo.toString(),
        pessoaId: transacaoAtual.pessoaId?.toString() || '',
        categoriaId: transacaoAtual.categoriaId?.toString() || '',
        data: transacaoAtual.data.split('T')[0]
      };
    }
    return { descricao: '', valor: '', tipo: '0', pessoaId: '', categoriaId: '', data: dataHoje };
  });

  const [listaPessoas, setListaPessoas] = useState<ItemOpcao[]>([]);
  const [listaCategorias, setListaCategorias] = useState<ItemOpcao[]>([]);

  React.useEffect(() => {
    api.get('/pessoas').then(res => setListaPessoas(res.data));
    api.get('/categorias').then(res => setListaCategorias(res.data));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descricao || !form.valor || !form.pessoaId || !form.categoriaId) return alert("Preencha tudo!");

    const payload = {
      id: transacaoAtual?.id,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      tipo: parseInt(form.tipo),
      pessoaId: parseInt(form.pessoaId),
      categoriaId: parseInt(form.categoriaId),
      data: new Date(form.data).toISOString()
    };

    try {
      if (transacaoAtual) {
        await api.put(`/transacoes/${transacaoAtual.id}`, payload);
      } else {
        await api.post('/transacoes', payload);
      }
      aoSalvar();
      onClose();
    } catch (error) {
      const err = error as AxiosError<{ errors: Record<string, string[]> }>;

      if (err.response?.data?.errors) {
        const mensagens = Object.values(err.response.data.errors).flat().join('\n');
        alert(`Erro de validação:\n${mensagens}`);
      } else {
        alert("Erro ao salvar. Verifique o console.");
      }
    }
  }

  return (
    <form onSubmit={salvar}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{fontSize: '0.8rem', color: '#aaa'}}>Data</label>
          <input name="data" type="date" value={form.data} onChange={handleChange} />
        </div>
        <div>
           <label style={{fontSize: '0.8rem', color: '#aaa'}}>Tipo</label>
           <select name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="0">Despesa</option>
            <option value="1">Receita</option>
          </select>
        </div>
      </div>

      <select name="pessoaId" value={form.pessoaId} onChange={handleChange}>
        <option value="">Quem pagou/recebeu?</option>
        {listaPessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
      </select>

      <select name="categoriaId" value={form.categoriaId} onChange={handleChange}>
        <option value="">Qual categoria?</option>
        {listaCategorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>

      <input name="descricao" placeholder="Descrição (ex: Burger King)" value={form.descricao} onChange={handleChange} />
      
      <input name="valor" type="number" step="0.01" placeholder="Valor (R$)" value={form.valor} onChange={handleChange} />

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" style={{ flex: 1, padding: '12px', background: '#8257e5', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {transacaoAtual ? 'Salvar Alterações' : 'Criar Transação'}
        </button>
      </div>
    </form>
  );
}