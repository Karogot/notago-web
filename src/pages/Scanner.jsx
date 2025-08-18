import React, { useState, useEffect } from 'react';
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
      const noteId = await saveNote(noteData);
      
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

  // Função para extrair a chave de acesso do QR code
  const extractAccessKey = (qrCodeData) => {
    // Implementação simplificada - em um caso real, precisaria de regex mais robusta
    // para extrair a chave de acesso de diferentes formatos de QR code
    
    // Exemplo: se o QR code contém a chave diretamente
    if (/^\d{44}$/.test(qrCodeData)) {
      return qrCodeData;
    }
    
    // Exemplo: se o QR code contém uma URL com a chave como parâmetro
    const match = qrCodeData.match(/[?&]chave=(\d{44})/);
    if (match) {
      return match[1];
    }
    
    // Simulação para desenvolvimento
    // Na versão real, retornaria null se não encontrasse a chave
    return '33250533130543002045650350002353891004729820';
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
