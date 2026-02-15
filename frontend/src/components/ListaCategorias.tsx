import { useEffect, useState } from 'react';
import api from '../services/api';

interface Categoria {
  id: number;
  nome: string;
  finalidade: number; // 0 = Despesa, 1 = Receita
}

export function ListaCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    api.get('/categorias')
      .then(response => setCategorias(response.data))
      .catch(error => console.error("Erro ao buscar categorias:", error));
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px', minWidth: '300px' }}>
      <h3>Categorias Existentes</h3>
      
      {categorias.length === 0 ? <p>Nenhuma categoria encontrada.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categorias.map(cat => (
            <li key={cat.id} style={{ 
                background: cat.finalidade === 1 ? '#d4edda' : '#f8d7da', 
                color: cat.finalidade === 1 ? '#155724' : '#721c24',
                margin: '5px 0', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <strong>{cat.nome}</strong>
              <small style={{ fontSize: '0.8em' }}>
                {cat.finalidade === 1 ? 'Receita' : 'Despesa'}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}