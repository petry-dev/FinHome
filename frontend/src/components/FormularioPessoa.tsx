import { useState } from 'react';
import api from '../services/api';

export function FormularioPessoa() {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');

  async function cadastrarPessoa(e: any) {
    e.preventDefault();

    if (!nome || !idade) return alert("Preencha todos os campos!");

    try {
        await api.post('/pessoas', {
            nome: nome,
            idade: parseInt(idade)
        });
        
        alert('Pessoa cadastrada com sucesso!');
        
        setNome('');
        setIdade('');
        
        window.location.reload(); 
    } catch (error) {
        alert('Erro ao cadastrar. Verifique se o Backend está rodando.');
        console.error(error);
    }
  }

  return (
    <form onSubmit={cadastrarPessoa} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' }}>
        <h3>Cadastrar Nova Pessoa</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
            <input
                placeholder="Nome da Pessoa"
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
                placeholder="Idade"
                type="number"
                value={idade}
                onChange={e => setIdade(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
            />
            <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Salvar
            </button>
        </div>
    </form>
  );
}