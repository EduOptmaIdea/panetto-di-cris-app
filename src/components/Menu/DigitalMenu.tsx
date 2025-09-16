import React, { useState } from 'react';
import { useApp } from '../../contexts/AppProvider';
import { Package, Plus, Minus, ShoppingCart } from 'lucide-react';

const DigitalMenu: React.FC = () => {
  const { products, categories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return product.isActive && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Panetto di Cris</h1>
          <p className="text-lg text-gray-600">Deliciosos panetones artesanais</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${selectedCategory === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Todos os Produtos
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-orange-300" />
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full mb-2">
                    {getCategoryName(product.category)}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>

                  {product.weight && (
                    <p className="text-sm text-gray-500 mb-2">Peso: {product.weight}g</p>
                  )}

                  {product.customPackaging && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Embalagem personalizada disponível
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </div>

                  <div className="flex items-center space-x-2">
                    {cart[product.id] ? (
                      <>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {cart[product.id]}
                        </span>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg"
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto disponível</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all'
                ? 'Não há produtos ativos no momento'
                : 'Não há produtos nesta categoria'}
            </p>
          </div>
        )}

        {/* Cart Summary */}
        {getCartItemCount() > 0 && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-900">
                    {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  R$ {getCartTotal().toFixed(2)}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg">
                Finalizar Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalMenu;