import { useState } from 'react';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { Modal } from '../components/Modal';
import api from '../services/api';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: number;
  date: string;
  personId: number;
  categoryId: number;
  personName: string;
  categoryName: string;
}

export function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function openNew() { setEditingTransaction(null); setIsFormOpen(true); }
  function openEdit(t: Transaction) { setEditingTransaction(t); setIsFormOpen(true); }
  function openDelete(t: Transaction) { setDeletingTransaction(t); setIsDeleteOpen(true); }

  async function confirmDelete() {
    if (deletingTransaction) {
      try {
        await api.delete(`/api/transactions/${deletingTransaction.id}`);
        setRefreshTrigger(prev => prev + 1);
        setIsDeleteOpen(false);
      } catch {
        alert('Error deleting transaction.');
      }
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card">
        <h2>
          Transactions
          <button onClick={openNew} className="btn-novo">+ New Transaction</button>
        </h2>
        <TransactionList
          onEdit={openEdit}
          onDeleteRequest={openDelete}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <Modal isOpen={isFormOpen} title={editingTransaction ? 'Edit Transaction' : 'New Transaction'} onClose={() => setIsFormOpen(false)}>
        <TransactionForm
          currentTransaction={editingTransaction}
          onClose={() => setIsFormOpen(false)}
          onSave={() => setRefreshTrigger(prev => prev + 1)}
        />
      </Modal>

      <Modal isOpen={isDeleteOpen} title="Delete Transaction" onClose={() => setIsDeleteOpen(false)}>
        <p style={{ marginBottom: '20px', color: '#555' }}>
          Delete <strong>{deletingTransaction?.description}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => setIsDeleteOpen(false)} style={{ width: 'auto', background: '#ccc', color: '#333' }}>Cancel</button>
          <button onClick={confirmDelete} style={{ width: 'auto', background: '#e55039' }}>Confirm Delete</button>
        </div>
      </Modal>
    </div>
  );
}
