/*
  # Criar tabela de histórico de preços

  1. Nova Tabela
    - `price_history`
      - `id` (uuid, chave primária)
      - `product_id` (uuid, referência para produto)
      - `price` (decimal, preço)
      - `sales_channel` (text, canal de venda)
      - `created_at` (timestamp, data da alteração)

  2. Segurança
    - Habilitar RLS na tabela `price_history`
    - Adicionar política para usuários autenticados
    - Chave estrangeira para produtos
*/

CREATE TYPE sales_channel AS ENUM ('direct', '99food', 'whatsapp', 'ifood');

CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  price decimal(10,2) NOT NULL,
  sales_channel sales_channel DEFAULT 'direct',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON price_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);