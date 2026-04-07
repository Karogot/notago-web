import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScanner = ({ onScanSuccess }) => {
  const [scanner, setScanner] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Inicializar o scanner
    const html5QrCode = new Html5Qrcode("reader");
    setScanner(html5QrCode);

    // Limpar
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error('Erro:', err));
      }
    };
  }, []);

  useEffect(() => {
    if (scanner) {
      startScanning();
    }
    // eslint-disable-next-line
  }, [scanner]);

  const startScanning = () => {
    if (!scanner) return;

    const config = { fps: 20, disableFlip: false };

    scanner.start(
      { facingMode: "environment" },
      config,
      (qrCodeMessage) => {
        scanner.stop().then(() => {
          onScanSuccess(qrCodeMessage);
        }).catch(err => {});
      },
      (errorMessage) => {}
    ).catch(err => {});
  };

  const handleFileUpload = (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsProcessing(true);
    setError(null);
    
    // Para a câmera da web e lé a foto de alta qualidade tirada
    if (scanner && scanner.isScanning) {
      scanner.stop().then(() => {
         scanImageFile(file);
      }).catch(() => scanImageFile(file));
    } else {
      scanImageFile(file);
    }
  };

  const scanImageFile = (file) => {
    if(!scanner) return;
    scanner.scanFile(file, true)
    .then(qrCodeMessage => {
      setIsProcessing(false);
      onScanSuccess(qrCodeMessage);
    })
    .catch(err => {
      setIsProcessing(false);
      setError('Não localizamos nenhum QRCode na foto. Tente uma foto mais nítida.');
      startScanning();
    });
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px'}}>
      
      {/* Botão de Foto Nativa Extra / Fallback */}
      <div style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
        <p style={{marginTop: 0, fontWeight: 'bold', color: '#3730a3'}}>Desfocando ao chegar perto?</p>
        <p style={{fontSize: '14px', marginBottom: '15px', color: '#4338ca'}}>Use a câmera principal do seu celular logo abaixo para tirar uma foto primeiro!</p>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          onChange={handleFileUpload} 
          style={{ width: '100%', marginBottom: '10px'}}
        />
        {isProcessing && <p style={{color: '#4f46e5', fontWeight: 'bold'}}>⏳ Lendo a nota fiscal...</p>}
      </div>

      {/* Câmera Web Antiga */}
      <div id="reader" style={{ width: '100%', minHeight: '300px' }}></div>
      {error && <p style={{color: 'red', textAlign: 'center', fontWeight: 'bold'}}>{error}</p>}
    </div>
  );
};

export default QrScanner;
