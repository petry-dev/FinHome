import { Pencil, Trash2 } from 'lucide-react';

interface BtnProps { onClick: () => void; }

export function EditButton({ onClick }: BtnProps) {
  return (
    <button onClick={onClick} title="Editar" className="fh-btn fh-btn-ghost fh-btn-icon">
      <Pencil size={16} color="var(--ink-2)" />
    </button>
  );
}

export function DeleteButton({ onClick }: BtnProps) {
  return (
    <button onClick={onClick} title="Excluir" className="fh-btn fh-btn-ghost fh-btn-icon">
      <Trash2 size={16} color="var(--neg)" />
    </button>
  );
}
