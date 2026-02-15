import { useEffect, useState } from 'react';
import api from '../services/api';

interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

export function ListaPessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  useEffect(() => {
    api.get('/pessoas')
      .then(response => {
        setPessoas(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar pessoas:", error);
      });
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px', marginTop: '20px' }}>
      <h2>Lista de Pessoas (Do Postgres)</h2>
      
      {pessoas.length === 0 ? (
        <p>Nenhuma pessoa encontrada...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {pessoas.map(pessoa => (
            <li key={pessoa.id} style={{ background: '#f4f4f4', margin: '5px 0', padding: '10px', borderRadius: '4px' }}>
              <strong>{pessoa.nome}</strong> - {pessoa.idade} anos
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}