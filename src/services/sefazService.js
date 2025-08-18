// Serviço para buscar dados da nota fiscal na SEFAZ
// Implementação simplificada para web

export const fetchNoteData = async (accessKey) => {
  try {
    console.log('Buscando dados da nota fiscal com a chave:', accessKey);
    
    // Na versão web, precisamos usar um proxy CORS para acessar o site da SEFAZ
    // Em um ambiente de produção, isso seria implementado com um serviço de backend
    
    // Simulação para desenvolvimento - em produção, isso seria substituído pela chamada real
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula o tempo de resposta
    
    // Dados simulados para desenvolvimento
    return {
      id: accessKey,
      accessKey: accessKey,
      storeName: 'CASAS GUANABARA COMESTIVEIS LTDA',
      cnpj: '33.130.543/0020-45',
      date: new Date().toISOString(),
      totalValue: 298.33,
      items: [
        {
          description: 'SACOLA PL MACRO VERDE 40X53',
          quantity: 10,
          unit: 'UN',
          unitPrice: 0.08,
          totalItemValue: 0.80
        },
        {
          description: 'FRALDA HUGGIES SUP CR JUMB XXG',
          quantity: 3,
          unit: 'PA',
          unitPrice: 23.98,
          totalItemValue: 71.94
        },
        {
          description: 'MACA ARGENTINA',
          quantity: 0.853,
          unit: 'KG',
          unitPrice: 18.65,
          totalItemValue: 15.91
        },
        {
          description: 'AGUA MIN MINALBA NATURAL S/G 1,5L',
          quantity: 6,
          unit: 'L',
          unitPrice: 2.32,
          totalItemValue: 13.92
        }
      ]
    };
    
  } catch (error) {
    console.error('Erro ao buscar dados na SEFAZ:', error);
    throw new Error('Não foi possível obter os dados da nota fiscal. Tente novamente mais tarde.');
  }
};
