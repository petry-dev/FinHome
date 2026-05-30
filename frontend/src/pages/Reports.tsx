import { useEffect, useState } from 'react';
import api from '../services/api';

interface PersonReport { name: string; totalIncome: number; totalExpense: number; balance: number; }
interface ReportSummary {
  details: PersonReport[];
  grandTotalIncome: number;
  grandTotalExpense: number;
  grandBalance: number;
}

export function ReportsPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.get('/api/reports/by-person')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load report. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading financial data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#c62828', background: '#ffebee', borderRadius: '8px', margin: '20px' }}>
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card">
        <h2>Consolidated Report</h2>
        <div className="card-body">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th style={{ textAlign: 'right' }}>Income (+)</th>
                <th style={{ textAlign: 'right' }}>Expenses (-)</th>
                <th style={{ textAlign: 'right' }}>Balance (=)</th>
              </tr>
            </thead>
            <tbody>
              {data.details.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: '500' }}>{item.name}</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>{fmt(item.totalIncome)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{fmt(item.totalExpense)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: item.balance >= 0 ? '#007bff' : '#e55039' }}>
                    {fmt(item.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
              <tr>
                <td style={{ padding: '15px' }}>GRAND TOTAL</td>
                <td style={{ textAlign: 'right', color: 'var(--success)' }}>{fmt(data.grandTotalIncome)}</td>
                <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{fmt(data.grandTotalExpense)}</td>
                <td style={{ textAlign: 'right', color: data.grandBalance >= 0 ? '#007bff' : '#e55039' }}>
                  {fmt(data.grandBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
