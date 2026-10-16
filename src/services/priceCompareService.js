// Comparador de preços: dado uma lista de produtos que o usuário quer comprar,
// busca no acervo compartilhado (Supabase) onde cada item está mais barato, e
// qual mercado (entre os que têm TODOS os itens) sai mais barato no total.
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { normalizeProductName } from './productNormalization';

// Busca produtos do acervo cujo nome normalizado contém o termo buscado.
// Ex.: termo "arroz" casa com "ARROZ TIO JOAO TIPO 1 5KG".
async function matchProducts(term) {
  const normalizedTerm = normalizeProductName(term);
  if (!normalizedTerm) return [];

  const { data, error } = await supabase
    .from('products')
    .select('id, normalized_name')
    .ilike('normalized_name', `%${normalizedTerm}%`);

  if (error) throw error;
  return data || [];
}

// Para uma lista de ids de produto, busca o preço mais recente de cada um em cada loja.
async function fetchLatestPricesByStore(productIds) {
  if (productIds.length === 0) return [];

  const { data, error } = await supabase
    .from('note_items')
    .select(
      'product_id, unit_price, description_raw, notes!inner(purchase_date, store_id, stores!inner(id, name, city))'
    )
    .in('product_id', productIds)
    .order('purchase_date', { referencedTable: 'notes', ascending: false });

  if (error) throw error;

  // Mantém só a linha mais recente por (produto, loja) - já vem ordenado por data desc.
  const seen = new Set();
  const latest = [];
  for (const row of data || []) {
    const key = `${row.product_id}|${row.notes.store_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    latest.push({
      productId: row.product_id,
      storeId: row.notes.store_id,
      storeName: row.notes.stores.name,
      storeCity: row.notes.stores.city,
      unitPrice: row.unit_price,
      description: row.description_raw,
    });
  }
  return latest;
}

// Para cada item da lista de compras, acha o(s) produto(s) do acervo que casam com o
// termo digitado, e devolve o menor preço encontrado (e em qual loja).
export async function findBestPricePerItem(shoppingList) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'O acervo compartilhado ainda não foi configurado (falta o .env do Supabase). Veja o README.'
    );
  }

  const results = [];

  for (const term of shoppingList) {
    const matches = await matchProducts(term);
    if (matches.length === 0) {
      results.push({ term, found: false, prices: [] });
      continue;
    }

    const prices = await fetchLatestPricesByStore(matches.map((m) => m.id));
    prices.sort((a, b) => a.unitPrice - b.unitPrice);

    results.push({
      term,
      found: prices.length > 0,
      bestPrice: prices[0] || null,
      prices, // todas as ofertas conhecidas, do mais barato pro mais caro
    });
  }

  return results;
}

// Dado o resultado de findBestPricePerItem, calcula o total da lista em cada loja
// que tem TODOS os itens, e ordena da mais barata para a mais cara.
export function compareTotalByStore(itemResults) {
  const storeTotals = new Map(); // storeId -> { storeName, storeCity, total, itemsCovered }

  const itemsWithPrices = itemResults.filter((r) => r.found);
  const totalItems = itemResults.length;

  for (const item of itemsWithPrices) {
    for (const price of item.prices) {
      const existing = storeTotals.get(price.storeId) || {
        storeId: price.storeId,
        storeName: price.storeName,
        storeCity: price.storeCity,
        total: 0,
        itemsCovered: new Set(),
      };
      // Só soma a primeira vez que vê esse item nessa loja (prices já está ordenado
      // por preço, mas aqui queremos qualquer oferta da loja para esse item).
      if (!existing.itemsCovered.has(item.term)) {
        existing.total += price.unitPrice;
        existing.itemsCovered.add(item.term);
      }
      storeTotals.set(price.storeId, existing);
    }
  }

  return Array.from(storeTotals.values())
    .map((s) => ({
      storeId: s.storeId,
      storeName: s.storeName,
      storeCity: s.storeCity,
      total: s.total,
      itemsCovered: s.itemsCovered.size,
      totalItems,
      hasAllItems: s.itemsCovered.size === totalItems,
    }))
    .sort((a, b) => {
      // Lojas com a lista completa vêm primeiro, depois por preço total.
      if (a.hasAllItems !== b.hasAllItems) return a.hasAllItems ? -1 : 1;
      return a.total - b.total;
    });
}
