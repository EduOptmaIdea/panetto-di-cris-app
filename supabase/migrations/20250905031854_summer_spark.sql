/*
  # Configurar políticas de autenticação

  1. Segurança
    - Habilitar RLS em todas as tabelas
    - Criar políticas para usuários autenticados
    - Garantir que apenas usuários logados acessem os dados

  2. Políticas
    - Permitir todas as operações para usuários autenticados
    - Bloquear acesso para usuários não autenticados
*/

-- Habilitar RLS em todas as tabelas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para customers
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON customers;
CREATE POLICY "Allow all operations for authenticated users"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para product_categories
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON product_categories;
CREATE POLICY "Allow all operations for authenticated users"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para products
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;
CREATE POLICY "Allow all operations for authenticated users"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para price_history
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON price_history;
CREATE POLICY "Allow all operations for authenticated users"
  ON price_history
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para orders
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON orders;
CREATE POLICY "Allow all operations for authenticated users"
  ON orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para order_items
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON order_items;
CREATE POLICY "Allow all operations for authenticated users"
  ON order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);