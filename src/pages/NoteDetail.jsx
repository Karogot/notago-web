import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNoteById } from '../services/storageService';
import { exportNotesAsCsv } from '../services/csvService';

function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNoteDetails();
  }, [id]);

  const loadNoteDetails = async () => {
    try {
      const noteData = await getNoteById(parseInt(id));
      setNote(noteData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar detalhes da nota:', error);
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (note) {
      try {
        exportNotesAsCsv([note]);
      } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        alert('Erro ao exportar CSV. Tente novamente.');
      }
    }
  };

  // Formatar valor para exibição (R$ 0,00)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data para exibição (DD/MM/YYYY HH:MM)
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="container">
      <div className="header">
        <Link to="/history" className="back-button">←</Link>
        <h1>Detalhes da Nota</h1>
      </div>
      
      {loading ? (
        <div className="loading">Carregando...</div>
      ) : note ? (
        <>
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>{note.storeName}</h2>
            <p><strong>CNPJ:</strong> {note.cnpj}</p>
            <p><strong>Data:</strong> {formatDateTime(note.date)}</p>
            <p><strong>Valor Total:</strong> {formatCurrency(note.totalValue)}</p>
            
            <button 
              className="btn btn-secondary" 
              onClick={handleExportCsv}
              style={{ marginTop: '16px' }}
            >
              Exportar esta nota (CSV)
            </button>
          </div>
          
          <h3 style={{ margin: '16px 0' }}>Itens da Nota</h3>
          
          {note.items && note.items.length > 0 ? (
            note.items.map((item, index) => (
              <div className="card" key={index}>
                <p><strong>{item.description}</strong></p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span>Qtd: {item.quantity} {item.unit}</span>
                  <span>Vl. Unit: {formatCurrency(item.unitPrice)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginTop: '8px',
                  fontWeight: 'bold'
                }}>
                  <span>Total: {formatCurrency(item.totalItemValue)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <p style={{ textAlign: 'center' }}>Nenhum item detalhado disponível.</p>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <p className="error-message">Nota fiscal não encontrada.</p>
          <Link to="/history" className="btn btn-primary" style={{ maxWidth: '250px', margin: '0 auto' }}>
            Voltar para o Histórico
          </Link>
        </div>
      )}
    </div>
  );
}

export default NoteDetail;
