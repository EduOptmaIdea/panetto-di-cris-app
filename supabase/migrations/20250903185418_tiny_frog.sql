/*
  # Criar tabela de itens do pedido

  1. Nova Tabela
    - `order_items`
      - `id` (uuid, chave primária)
      - `order_id` (uuid, referência para pedido)
      - `product_id` (uuid, referência para produto)
      - `quantity` (integer, quantidade)
      - `unit_price` (decimal, preço unitário)
      - `total` (decimal, total do item)
      - `created_at` (timestamp, data de criação)

  2. Segurança
    - Habilitar RLS na tabela `order_items`
    - Adicionar política para usuários autenticados
    - Chaves estrangeiras para pedidos e produtos
*/

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);