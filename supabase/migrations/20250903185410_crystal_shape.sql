/*
  # Criar tabela de pedidos

  1. Nova Tabela
    - `orders`
      - `id` (uuid, chave primária)
      - `customer_id` (uuid, referência para cliente)
      - `subtotal` (decimal, subtotal do pedido)
      - `delivery_fee` (decimal, taxa de entrega)
      - `total` (decimal, total do pedido)
      - `status` (enum, status do pedido)
      - `payment_status` (enum, status do pagamento)
      - `payment_method` (enum, método de pagamento)
      - `delivery_method` (enum, método de entrega)
      - `sales_channel` (enum, canal de venda)
      - `estimated_delivery` (timestamp, previsão de entrega)
      - `completed_at` (timestamp, data de conclusão)
      - `notes` (text, observações do pedido)
      - `created_at` (timestamp, data do pedido)
      - `updated_at` (timestamp, data de atualização)

  2. Segurança
    - Habilitar RLS na tabela `orders`
    - Adicionar política para usuários autenticados
    - Chave estrangeira para clientes
*/

CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'pix', 'transfer');
CREATE TYPE delivery_method AS ENUM ('pickup', 'delivery');

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  subtotal decimal(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee decimal(10,2) DEFAULT 0.00,
  total decimal(10,2) NOT NULL DEFAULT 0.00,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method DEFAULT 'cash',
  delivery_method delivery_method DEFAULT 'pickup',
  sales_channel sales_channel DEFAULT 'direct',
  estimated_delivery timestamptz,
  completed_at timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();