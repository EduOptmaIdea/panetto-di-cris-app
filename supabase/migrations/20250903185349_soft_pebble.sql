/*
  # Criar tabela de clientes

  1. Nova Tabela
    - `customers`
      - `id` (uuid, chave primária)
      - `name` (text, nome do cliente)
      - `whatsapp` (text, número do WhatsApp)
      - `address` (text, endereço completo)
      - `observations` (text, observações sobre o cliente)
      - `delivery_preferences` (text, preferências de entrega)
      - `total_orders` (integer, total de pedidos)
      - `total_spent` (decimal, total gasto)
      - `created_at` (timestamp, data de criação)
      - `updated_at` (timestamp, data de atualização)

  2. Segurança
    - Habilitar RLS na tabela `customers`
    - Adicionar política para usuários autenticados lerem e modificarem dados
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  address text NOT NULL,
  observations text DEFAULT '',
  delivery_preferences text DEFAULT '',
  total_orders integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();