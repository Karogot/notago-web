import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { findBestPricePerItem, compareTotalByStore } from '../services/priceCompareService';

function ShoppingList() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemResults, setItemResults] = useState(null);
  const [storeTotals, setStoreTotals] = useState(null);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleSearch = async () => {
    const items = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (items.length === 0) return;

    setLoading(true);
    setError(null);
    setItemResults(null);
    setStoreTotals(null);

    try {
      const results = await findBestPricePerItem(items);
      setItemResults(results);
      setStoreTotals(compareTotalByStore(results));
    } catch (err) {
      console.error('Erro ao comparar preços:', err);
      setError('Não foi possível buscar os preços agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <Link to="/" className="back-button">←</Link>
        <h1>Minha Lista de Compras</h1>
      </div>

      <div className="card">
        <p style={{ marginTop: 0 }}>Digite um produto por linha (ex.: arroz, leite, sabão em pó):</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          style={{ width: '100%', padding: '10px', fontSize: '16px', boxSizing: 'border-box' }}
          placeholder={'arroz\nfeijão\nleite'}
        />
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Buscando...' : 'Comparar preços'}
        </button>
      </div>

      {error && (
        <div className="card">
          <p className="error-message">{error}</p>
        </div>
      )}

      {itemResults && (
        <>
          <h3 style={{ margin: '16px 0' }}>Menor preço por item</h3>
          {itemResults.map((item) => (
            <div className="card" key={item.term}>
              <p style={{ marginTop: 0, fontWeight: 'bold' }}>{item.term}</p>
              {item.found ? (
                <p style={{ margin: 0 }}>
                  {item.bestPrice.description} — {formatCurrency(item.bestPrice.unitPrice)} em{' '}
                  {item.bestPrice.storeName}
                  {item.bestPrice.storeCity ? ` (${item.bestPrice.storeCity})` : ''}
                </p>
              ) : (
                <p style={{ margin: 0, color: '#888' }}>
                  Ainda não há notas no acervo com esse produto.
                </p>
              )}
            </div>
          ))}

          {storeTotals && storeTotals.length > 0 && (
            <>
              <h3 style={{ margin: '16px 0' }}>Onde sai mais barato comprar tudo</h3>
              {storeTotals.map((store) => (
                <div className="card" key={store.storeId}>
                  <p style={{ marginTop: 0, fontWeight: 'bold' }}>
                    {store.storeName}
                    {store.storeCity ? ` (${store.storeCity})` : ''}
                  </p>
                  <p style={{ margin: 0 }}>
                    {store.hasAllItems
                      ? `Total: ${formatCurrency(store.total)}`
                      : `Tem ${store.itemsCovered} de ${store.totalItems} itens — total parcial: ${formatCurrency(store.total)}`}
                  </p>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ShoppingList;
