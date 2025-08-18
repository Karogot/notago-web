// Serviço para armazenamento local usando IndexedDB
import Dexie from 'dexie';

// Criar banco de dados IndexedDB
const db = new Dexie('NotaGoDB');
db.version(1).stores({
  notes: '++id, storeName, date, totalValue',
  items: '++id, noteId, description, quantity, unitPrice, totalValue'
});

// Salvar nota fiscal
export const saveNote = async (noteData) => {
  try {
    console.log('Salvando nota fiscal:', noteData);
    
    // Simulação para desenvolvimento - em produção, isso usaria o Dexie real
    // Salvar dados principais da nota
    const noteId = Date.now(); // Simula um ID único
    
    // Em um ambiente real, os dados seriam salvos no IndexedDB
    // Aqui estamos apenas simulando o sucesso da operação
    
    // Armazenar no localStorage para simular persistência
    const savedNotes = JSON.parse(localStorage.getItem('notago_notes') || '[]');
    const newNote = {
      id: noteId,
      accessKey: noteData.accessKey,
      storeName: noteData.storeName,
      cnpj: noteData.cnpj,
      date: noteData.date,
      totalValue: noteData.totalValue,
      items: noteData.items || []
    };
    
    savedNotes.push(newNote);
    localStorage.setItem('notago_notes', JSON.stringify(savedNotes));
    
    return noteId;
  } catch (error) {
    console.error('Erro ao salvar nota:', error);
    throw error;
  }
};

// Buscar todas as notas
export const getAllNotes = async () => {
  try {
    // Simulação para desenvolvimento - em produção, isso usaria o Dexie real
    const savedNotes = JSON.parse(localStorage.getItem('notago_notes') || '[]');
    return savedNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return [];
  }
};

// Buscar nota por ID
export const getNoteById = async (id) => {
  try {
    // Simulação para desenvolvimento - em produção, isso usaria o Dexie real
    const savedNotes = JSON.parse(localStorage.getItem('notago_notes') || '[]');
    return savedNotes.find(note => note.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar nota por ID:', error);
    return null;
  }
};

// Calcular total mensal
export const getMonthlyTotal = async (year, month) => {
  try {
    // Simulação para desenvolvimento - em produção, isso usaria o Dexie real
    const savedNotes = JSON.parse(localStorage.getItem('notago_notes') || '[]');
    
    const filteredNotes = savedNotes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate.getFullYear() === year && noteDate.getMonth() === month;
    });
    
    return filteredNotes.reduce((sum, note) => sum + note.totalValue, 0);
  } catch (error) {
    console.error('Erro ao calcular total mensal:', error);
    return 0;
  }
};
