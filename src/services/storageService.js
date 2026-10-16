// Armazenamento local (histórico pessoal, funciona offline) + sincronização com o
// acervo compartilhado no Supabase (onde o comparador de preços busca os dados).
import Dexie from 'dexie';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { normalizeProductName } from './productNormalization';

const db = new Dexie('NotaGoDB');
db.version(1).stores({
  notes: '++localId, id, accessKey, storeName, date, totalValue',
});

export const saveNote = async (noteData) => {
  const localId = await db.notes.add({
    id: noteData.accessKey,
    accessKey: noteData.accessKey,
    storeName: noteData.storeName,
    cnpj: noteData.cnpj,
    date: noteData.date,
    totalValue: noteData.totalValue,
    items: noteData.items || [],
  });

  try {
    await syncNoteToSupabase(noteData);
  } catch (error) {
    // Falha ao sincronizar não deve impedir o uso local do app (ex.: sem internet,
    // ou .env do Supabase ainda não configurado).
    console.warn('Não foi possível sincronizar a nota com o acervo compartilhado:', error.message);
  }

  return localId;
};

async function syncNoteToSupabase(noteData) {
  if (!isSupabaseConfigured) return;

  const storeId = await findOrCreateStore(noteData);

  const { error: noteError } = await supabase.from('notes').insert({
    access_key: noteData.accessKey,
    store_id: storeId,
    purchase_date: noteData.date,
    total_value: noteData.totalValue,
  });

  // Chave de acesso é única: se a nota já tinha sido enviada antes (ex.: reenvio),
  // o erro de duplicidade é esperado e não é um problema real.
  if (noteError && !isDuplicateKeyError(noteError)) {
    throw noteError;
  }
  if (noteError) return; // já existia, não reprocessa os itens

  const { data: insertedNote } = await supabase
    .from('notes')
    .select('id')
    .eq('access_key', noteData.accessKey)
    .single();

  for (const item of noteData.items || []) {
    const productId = await findOrCreateProduct(item.description);
    await supabase.from('note_items').insert({
      note_id: insertedNote.id,
      product_id: productId,
      description_raw: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unitPrice,
      total_value: item.totalItemValue,
    });
  }
}

async function findOrCreateStore(noteData) {
  const { data: existing } = await supabase
    .from('stores')
    .select('id')
    .eq('cnpj', noteData.cnpj)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('stores')
    .insert({ cnpj: noteData.cnpj, name: noteData.storeName })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

async function findOrCreateProduct(descriptionRaw) {
  const normalized = normalizeProductName(descriptionRaw);

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('normalized_name', normalized)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('products')
    .insert({ normalized_name: normalized })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

function isDuplicateKeyError(error) {
  return error.code === '23505';
}

export const getAllNotes = async () => {
  const notes = await db.notes.toArray();
  return notes.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getNoteById = async (localId) => {
  return (await db.notes.get(localId)) || null;
};

export const getMonthlyTotal = async (year, month) => {
  const notes = await db.notes.toArray();
  return notes
    .filter((note) => {
      const noteDate = new Date(note.date);
      return noteDate.getFullYear() === year && noteDate.getMonth() === month;
    })
    .reduce((sum, note) => sum + (note.totalValue || 0), 0);
};
