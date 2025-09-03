/*
  # Inserir dados de exemplo

  1. Dados de Exemplo
    - Categorias de produtos (panetones, chocotones, bolos)
    - Produtos básicos da paneteria
    - Cliente de exemplo
    - Pedido de exemplo

  2. Observações
    - Dados realistas para demonstração
    - Preços compatíveis com mercado de panetones
    - Estrutura pronta para expansão
*/

-- Inserir categorias
INSERT INTO product_categories (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Panetones Tradicionais', 'Panetones clássicos com frutas cristalizadas'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Panetones Gourmet', 'Panetones especiais com ingredientes premium'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Chocotones', 'Panetones de chocolate em diversas variações'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Bolos de Festa', 'Bolos especiais para ocasiões especiais')
ON CONFLICT (id) DO NOTHING;

-- Inserir produtos
INSERT INTO products (id, name, description, category_id, price, weight, custom_packaging, is_active) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Panetone Tradicional 500g', 'Panetone tradicional com frutas cristalizadas e passas selecionadas', '550e8400-e29b-41d4-a716-446655440001', 25.90, 500, true, true),
  ('660e8400-e29b-41d4-a716-446655440002', 'Panetone Tradicional 750g', 'Panetone tradicional tamanho família com frutas cristalizadas', '550e8400-e29b-41d4-a716-446655440001', 35.90, 750, true, true),
  ('660e8400-e29b-41d4-a716-446655440003', 'Chocotone Premium 500g', 'Chocotone com gotas de chocolate belga e recheio cremoso', '550e8400-e29b-41d4-a716-446655440003', 32.90, 500, true, true),
  ('660e8400-e29b-41d4-a716-446655440004', 'Chocotone Premium 750g', 'Chocotone premium tamanho família com chocolate belga', '550e8400-e29b-41d4-a716-446655440003', 42.90, 750, true, true),
  ('660e8400-e29b-41d4-a716-446655440005', 'Panetone Gourmet Pistache', 'Panetone gourmet com pistache e frutas secas nobres', '550e8400-e29b-41d4-a716-446655440002', 48.90, 600, true, true),
  ('660e8400-e29b-41d4-a716-446655440006', 'Bolo de Chocolate 1kg', 'Bolo de chocolate com cobertura de brigadeiro', '550e8400-e29b-41d4-a716-446655440004', 45.00, 1000, false, true)
ON CONFLICT (id) DO NOTHING;

-- Inserir histórico de preços
INSERT INTO price_history (product_id, price, sales_channel) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 25.90, 'direct'),
  ('660e8400-e29b-41d4-a716-446655440002', 35.90, 'direct'),
  ('660e8400-e29b-41d4-a716-446655440003', 32.90, 'direct'),
  ('660e8400-e29b-41d4-a716-446655440004', 42.90, 'direct'),
  ('660e8400-e29b-41d4-a716-446655440005', 48.90, 'direct'),
  ('660e8400-e29b-41d4-a716-446655440006', 45.00, 'direct')
ON CONFLICT DO NOTHING;

-- Inserir cliente de exemplo
INSERT INTO customers (id, name, whatsapp, address, observations, delivery_preferences) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Maria Silva', '(11) 99999-9999', 'Rua das Flores, 123 - Centro - São Paulo/SP', 'Prefere entrega pela manhã', 'Manhã (8h às 12h)')
ON CONFLICT (id) DO NOTHING;