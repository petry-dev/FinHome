import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
        </div>
        {children}
      </div>
    </div>
  );
}