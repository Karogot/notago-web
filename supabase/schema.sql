-- Schema do acervo compartilhado de preços do NotaGo.
-- Rode isso uma vez no SQL Editor do seu projeto Supabase (depois de criar a conta).

create extension if not exists "pgcrypto";

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  cnpj text not null unique,
  name text not null,
  address text,
  city text,
  state text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  access_key text not null unique,
  store_id uuid not null references stores(id),
  purchase_date timestamptz,
  total_value numeric(10, 2),
  created_at timestamptz not null default now()
);

create table if not exists note_items (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  product_id uuid not null references products(id),
  description_raw text not null,
  quantity numeric,
  unit text,
  unit_price numeric(10, 2),
  total_value numeric(10, 2)
);

create index if not exists idx_note_items_product on note_items(product_id);
create index if not exists idx_note_items_note on note_items(note_id);
create index if not exists idx_notes_store on notes(store_id);

-- RLS: app sem login (contribuições anônimas), então liberamos leitura e inserção
-- para todo mundo, mas NÃO liberamos update/delete pelo cliente (protege o acervo
-- contra alteração/apagamento malicioso vindo do app).
alter table stores enable row level security;
alter table products enable row level security;
alter table notes enable row level security;
alter table note_items enable row level security;

create policy "stores: leitura publica" on stores for select using (true);
create policy "stores: insercao publica" on stores for insert with check (true);

create policy "products: leitura publica" on products for select using (true);
create policy "products: insercao publica" on products for insert with check (true);

create policy "notes: leitura publica" on notes for select using (true);
create policy "notes: insercao publica" on notes for insert with check (true);

create policy "note_items: leitura publica" on note_items for select using (true);
create policy "note_items: insercao publica" on note_items for insert with check (true);
