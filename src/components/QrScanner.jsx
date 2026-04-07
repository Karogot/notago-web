import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScanner = ({ onScanSuccess }) => {
  const [scanner, setScanner] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Inicializar o scanner
    const html5QrCode = new Html5Qrcode("reader");
    setScanner(html5QrCode);

    // Limpar ao desmontar o componente
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error('Erro ao parar scanner:', err));
      }
    };
  }, []);

  useEffect(() => {
    if (scanner) {
      startScanning();
    }
  }, [scanner]);

  const startScanning = () => {
    if (!scanner) return;

    onst config = { 
      fps: 20, 
      disableFlip: false
    };

    scanner.start(
      { facingMode: "environment" }, // Usa câmera traseira
      config,
      (qrCodeMessage) => {
        // QR Code detectado
        scanner.stop().then(() => {
          onScanSuccess(qrCodeMessage);
        }).catch(err => {
          console.error('Erro ao parar scanner após detecção:', err);
        });
      },
      (errorMessage) => {
        // Erros durante o escaneamento são ignorados para continuar tentando
        console.log('Erro durante escaneamento:', errorMessage);
      }
    ).catch(err => {
      console.error('Erro ao iniciar scanner:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
    });
  };

  return (
    <div>
      <div id="reader" style={{ width: '100%', height: '100%' }}></div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default QrScanner;
