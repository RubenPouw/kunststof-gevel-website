import { getSql } from "@/lib/db/client";

const STATEMENTS = [
  `create table if not exists shopify_product (
    id text primary key,
    handle text not null unique,
    updated_at timestamptz,
    payload jsonb not null,
    metafields jsonb not null default '[]'::jsonb,
    fetched_at timestamptz not null default now()
  )`,
  `create table if not exists shopify_collection (
    id text primary key,
    handle text not null unique,
    title text not null default '',
    description text not null default '',
    fetched_at timestamptz not null default now()
  )`,
  `create table if not exists catalog_product (
    slug text primary key,
    category text not null,
    brand_slug text not null,
    updated_at timestamptz,
    payload jsonb not null
  )`,
  `create index if not exists catalog_product_category_idx on catalog_product (category)`,
  `create index if not exists catalog_product_brand_idx on catalog_product (brand_slug)`,
  `create table if not exists catalog_state (
    key text primary key,
    value text not null,
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists reviews (
    source text not null,
    external_id text not null,
    author_name text not null,
    rating numeric not null,
    text text not null default '',
    language text not null default '',
    created_at timestamptz not null,
    reply_text text,
    verified boolean not null default false,
    source_url text,
    fetched_at timestamptz not null default now(),
    primary key (source, external_id)
  )`,
  `create index if not exists reviews_source_created_idx on reviews (source, created_at desc)`,
];

export async function migrate() {
  const sql = getSql();
  if (!sql) return false;
  for (const statement of STATEMENTS) {
    await sql.unsafe(statement);
  }
  return true;
}
