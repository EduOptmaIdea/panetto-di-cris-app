/*
  # Criar tabela de categorias de produtos

  1. Nova Tabela
    - `product_categories`
      - `id` (uuid, chave primária)
      - `name` (text, nome da categoria)
      - `description` (text, descrição da categoria)
      - `created_at` (timestamp, data de criação)

  2. Segurança
    - Habilitar RLS na tabela `product_categories`
    - Adicionar política para usuários autenticados
*/

CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);