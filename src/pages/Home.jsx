import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>NotaGo</h1>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 100px)'
      }}>
        <Link to="/scanner" className="btn btn-primary" style={{ marginBottom: '20px' }}>
          <span style={{ marginRight: '10px' }}>📷</span>
          Escanear Nova Nota
        </Link>
        
        <Link to="/history" className="btn btn-secondary">
          <span style={{ marginRight: '10px' }}>📋</span>
          Ver Histórico
        </Link>
      </div>
    </div>
  );
}

export default Home;
