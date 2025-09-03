/*
  # Criar tabela de produtos

  1. Nova Tabela
    - `products`
      - `id` (uuid, chave primária)
      - `name` (text, nome do produto)
      - `description` (text, descrição do produto)
      - `category_id` (uuid, referência para categoria)
      - `price` (decimal, preço atual)
      - `image_url` (text, URL da imagem)
      - `weight` (integer, peso em gramas)
      - `custom_packaging` (boolean, embalagem personalizada)
      - `is_active` (boolean, produto ativo)
      - `total_sold` (integer, total vendido)
      - `created_at` (timestamp, data de criação)
      - `updated_at` (timestamp, data de atualização)

  2. Segurança
    - Habilitar RLS na tabela `products`
    - Adicionar política para usuários autenticados
    - Chave estrangeira para categorias
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  price decimal(10,2) NOT NULL,
  image_url text DEFAULT '',
  weight integer DEFAULT 0,
  custom_packaging boolean DEFAULT false,
  is_active boolean DEFAULT true,
  total_sold integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();