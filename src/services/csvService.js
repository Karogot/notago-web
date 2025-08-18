// Serviço para exportação de dados em formato CSV
export const exportNotesAsCsv = (notes) => {
  try {
    console.log('Exportando notas para CSV:', notes);
    
    // Cabeçalho do CSV
    let csvContent = 'Nome Estabelecimento;CNPJ;Data;Valor Total;Descrição Item;Quantidade;Unidade;Valor Unitário;Valor Total Item\n';
    
    // Adicionar linhas para cada nota e seus itens
    notes.forEach(note => {
      const date = new Date(note.date).toLocaleDateString('pt-BR');
      
      if (!note.items || note.items.length === 0) {
        // Se a nota não tiver itens, adiciona uma linha apenas com os dados da nota
        csvContent += `${note.storeName};${note.cnpj};${date};${note.totalValue.toFixed(2)};;;;;\n`;
      } else {
        // Se tiver itens, adiciona uma linha para cada item
        note.items.forEach(item => {
          csvContent += `${note.storeName};${note.cnpj};${date};${note.totalValue.toFixed(2)};${item.description};${item.quantity};${item.unit};${item.unitPrice.toFixed(2)};${item.totalItemValue.toFixed(2)}\n`;
        });
      }
    });
    
    // Criar blob e fazer download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Criar URL para o blob
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notago_historico_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    // Adicionar à página, clicar e remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw error;
  }
};
