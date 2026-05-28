import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Transaction } from '../pages/Transactions';
import { EditButton, DeleteButton } from './Buttons';

interface Props {
  onEdit: (t: Transaction) => void;
  onDeleteRequest: (t: Transaction) => void;
  refreshTrigger: number;
}

export function TransactionList({ onEdit, onDeleteRequest, refreshTrigger }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.get('/api/transactions?pageSize=50').then(res => setTransactions(res.data.items));
  }, [refreshTrigger]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  return (
    <div className="card-body">
      <table>
        <thead>
          <tr>
            <th>Person</th>
            <th>Description</th>
            <th>Category</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td style={{ fontWeight: '500' }}>{t.personName || '---'}</td>
              <td>
                <div style={{ fontWeight: '500' }}>{t.description}</div>
                <small style={{ color: '#999', fontSize: '0.8rem' }}>{new Date(t.date).toLocaleDateString()}</small>
              </td>
              <td>{t.categoryName}</td>
              <td style={{ fontWeight: 'bold', color: t.type === 1 ? 'var(--success)' : 'var(--danger)', textAlign: 'right' }}>
                {t.type === 1 ? '+ ' : '- '}{fmt(t.amount)}
              </td>
              <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
                <EditButton onClick={() => onEdit(t)} />
                <DeleteButton onClick={() => onDeleteRequest(t)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
