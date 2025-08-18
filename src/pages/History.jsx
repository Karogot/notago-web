import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotes, getMonthlyTotal } from '../services/storageService';
import { exportNotesAsCsv } from '../services/csvService';

function History() {
  const [notes, setNotes] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar notas fiscais ao montar o componente
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      // Buscar todas as notas do armazenamento local
      const savedNotes = await getAllNotes();
      setNotes(savedNotes);
      
      // Configurar mês atual e calcular total
      const now = new Date();
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      setCurrentMonth(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
      
      // Calcular total do mês atual
      const total = savedNotes
        .filter(note => {
          const noteDate = new Date(note.date);
          return noteDate.getMonth() === now.getMonth() && 
                 noteDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, note) => sum + note.totalValue, 0);
      
      setMonthlyTotal(total);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    try {
      exportNotesAsCsv(notes);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar CSV. Tente novamente.');
    }
  };

  // Formatar valor para exibição (R$ 0,00)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data para exibição (DD/MM/YYYY)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="container">
      <div className="header">
        <Link to="/" className="back-button">←</Link>
        <h1>Histórico de Notas</h1>
      </div>
      
      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          <div className="month-summary">
            <h2>{currentMonth}</h2>
            <p>Gasto Total: {formatCurrency(monthlyTotal)}</p>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleExportCsv}
            style={{ marginBottom: '20px' }}
          >
            Exportar CSV
          </button>
          
          <div className="note-list">
            {notes.length === 0 ? (
              <div className="card">
                <p style={{ textAlign: 'center' }}>
                  Nenhuma nota fiscal encontrada.
                  <br />
                  Escaneie uma nota para começar!
                </p>
              </div>
            ) : (
              notes.map(note => (
                <Link 
                  to={`/note/${note.id}`} 
                  key={note.id}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card note-item">
                    <div className="note-item-left">
                      <span className="note-item-store">{note.storeName}</span>
                      <span className="note-item-date">{formatDate(note.date)}</span>
                    </div>
                    <span className="note-item-value">{formatCurrency(note.totalValue)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default History;
