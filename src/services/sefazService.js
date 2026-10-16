// Serviço para buscar dados reais da nota fiscal na SEFAZ.
//
// A busca em si (abrir a página oficial dentro de uma WebView nativa e ler o conteúdo)
// está em nfceScraperService.js - esse scraping só funciona dentro do app Android/iOS
// (Capacitor), não roda num backend, porque a SEFAZ bloqueia acessos vindos de IP de
// nuvem/datacenter (testado com chaves reais do RJ).
import { fetchNfceData } from './nfceScraperService';

export const fetchNoteData = async (accessKey) => {
  try {
    return await fetchNfceData(accessKey);
  } catch (error) {
    console.error('Erro ao buscar dados na SEFAZ:', error);
    throw new Error(error.message || 'Não foi possível obter os dados da nota fiscal. Tente novamente mais tarde.');
  }
};
