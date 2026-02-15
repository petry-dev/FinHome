import React, { useState } from 'react';
import api from '../services/api';

export function FormularioCategoria() {
  const [nome, setNome] = useState('');
  const [finalidade, setFinalidade] = useState('0'); 

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    
    if (!nome) return alert("Digite um nome para a categoria!");

    try {
        await api.post('/categorias', {
            nome: nome,
            finalidade: parseInt(finalidade)
        });
        alert('Categoria salva!');
        window.location.reload();
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar categoria.');
    }
  }

  return (
    <form onSubmit={salvar} style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff', minWidth: '300px' }}>
        <h3>Nova Categoria</h3>
        <input 
            placeholder="Nome (ex: Mercado)" 
            value={nome} onChange={e => setNome(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
        
        <div style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
            <label style={{ cursor: 'pointer' }}>
                <input type="radio" name="fin" value="0" checked={finalidade === '0'} onChange={e => setFinalidade(e.target.value)} /> 
                Despesa
            </label>
            <label style={{ cursor: 'pointer' }}>
                <input type="radio" name="fin" value="1" checked={finalidade === '1'} onChange={e => setFinalidade(e.target.value)} /> 
                Receita
            </label>
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Salvar Categoria
        </button>
    </form>
  );
}