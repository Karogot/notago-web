import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import QrScanner from '../components/QrScanner';
import { fetchNoteData } from '../services/sefazService';
import { saveNote } from '../services/storageService';

function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleScanSuccess = async (qrCodeData) => {
    setScanning(false);
    setProcessing(true);
    setError(null);
    
    try {
      // Extrair a chave de acesso do QR code
      const accessKey = extractAccessKey(qrCodeData);
      
      if (!accessKey) {
        throw new Error('QR code inválido. Não foi possível encontrar a chave de acesso.');
      }
      
      // Buscar dados da nota fiscal na SEFAZ
      const noteData = await fetchNoteData(accessKey);
      
      if (!noteData) {
        throw new Error('Não foi possível obter os dados da nota fiscal.');
      }
      
      // Salvar a nota no armazenamento local
      await saveNote(noteData);

      // Mostrar mensagem de sucesso
      setSuccess(true);
      setProcessing(false);
      
      // Redirecionar para o histórico após 2 segundos
      setTimeout(() => {
        navigate('/history');
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao processar QR code:', err);
      setError(err.message || 'Ocorreu um erro ao processar o QR code.');
      setProcessing(false);
    }
  };

  // Extrai a chave de acesso (44 dígitos) do conteúdo real do QR code da NFC-e.
  // O QR code nacional de NFC-e é uma URL como:
  //   https://www.fazenda.rj.gov.br/nfce/consulta?p=33260461...4672|2|1|1|<hash>
  // então a chave normalmente vem no parâmetro "p=" (ou "chave="), separada por "|".
  const extractAccessKey = (qrCodeData) => {
    if (!qrCodeData) return null;

    const pMatch = qrCodeData.match(/[?&]p=(\d{44})/);
    if (pMatch) return pMatch[1];

    const chaveMatch = qrCodeData.match(/[?&]chave=(\d{44})/);
    if (chaveMatch) return chaveMatch[1];

    // QR code com a chave pura, com ou sem espaços (ex.: texto impresso do cupom).
    const digitsOnly = qrCodeData.replace(/\s/g, '');
    if (/^\d{44}$/.test(digitsOnly)) return digitsOnly;

    // Último recurso: procura 44 dígitos seguidos em qualquer lugar do texto.
    const anyKeyMatch = qrCodeData.replace(/\s/g, '').match(/\d{44}/);
    if (anyKeyMatch) return anyKeyMatch[0];

    return null;
  };

  return (
    <div className="container">
      <div className="header">
        <Link to="/" className="back-button">←</Link>
        <h1>Escanear Nota</h1>
      </div>
      
      <div className="scanner-container">
        {!scanning && !processing && !success && !error && (
          <button 
            className="btn btn-primary" 
            onClick={() => setScanning(true)}
            style={{ maxWidth: '250px' }}
          >
            Iniciar Scanner
          </button>
        )}
        
        {scanning && (
          <div className="scanner-frame">
            <QrScanner onScanSuccess={handleScanSuccess} />
            <div className="scanner-message">
              Posicione o QR code da nota fiscal dentro da área
            </div>
          </div>
        )}
        
        {processing && (
          <div className="card">
            <p style={{ textAlign: 'center' }}>
              Processando nota fiscal...
              <br />
              <span style={{ fontSize: '24px', display: 'block', margin: '20px 0' }}>⏳</span>
            </p>
          </div>
        )}
        
        {error && (
          <div className="card">
            <p className="error-message">{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setError(null);
                setScanning(false);
              }}
              style={{ maxWidth: '250px', margin: '0 auto' }}
            >
              Tentar Novamente
            </button>
          </div>
        )}
        
        {success && (
          <div className="card">
            <p className="success-message">
              Nota fiscal processada com sucesso!
              <br />
              <span style={{ fontSize: '24px', display: 'block', margin: '20px 0' }}>✅</span>
              Redirecionando para o histórico...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Scanner;
