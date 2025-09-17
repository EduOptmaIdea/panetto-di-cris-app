import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
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
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header com Categorias */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <h1 className="text-xl font-bold text-gray-800">Menu Digital</h1>
          <nav className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${selectedCategory === 'all' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700'
                }`}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${selectedCategory === category.id ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Product Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
                <img
                  src={product.image || 'https://via.placeholder.com/400x300.png?text=Sem+Imagem'}
                  alt={product.name}
                  className="w-full h-48 object-cover object-center"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-xs font-semibold uppercase text-gray-500 mb-1">
                    {getCategoryName(product.category)}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex-grow">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                    <span className="text-xl font-bold text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </span>
                    {cart[product.id] > 0 ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          <Minus size={20} />
                        </button>
                        <span className="text-lg font-semibold">{cart[product.id]}</span>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="p-1 rounded-full text-orange-600 bg-orange-100 hover:bg-orange-200 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
                      >
                        <Plus size={16} />
                        <span>Adicionar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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