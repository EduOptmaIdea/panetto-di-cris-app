import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Package, Plus, Minus } from 'lucide-react';

const DigitalMenu: React.FC = () => {
  const { products, categories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  const filteredProducts = products.filter(product => {
    const productCategory = categories.find(cat => cat.id === product.category);
    const categoryIsActive = productCategory?.isActive ?? true;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return product.isActive && matchesCategory && categoryIsActive;
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-orange-600">Panetto di Cris</h1>
        </div>
      </header>

      <nav className="sticky top-[72px] bg-white shadow-sm p-2 overflow-x-auto z-10">
        <div className="flex space-x-2 max-w-lg mx-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Todos
          </button>
          {categories.filter(cat => cat.isActive).map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${selectedCategory === category.id ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      {/* ✅ Removida a classe 'max-w-lg mx-auto' para ocupar todo o espaço na tela */}
      <main className="p-4 sm:p-6 lg:p-8">
        {currentCategory && selectedCategory !== 'all' && (
          <div className="max-w-5xl mx-auto mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200 shadow-sm">
            <h2 className="text-xl font-bold text-orange-800 mb-1">{currentCategory.name}</h2>
            <p className="text-sm text-gray-700">{currentCategory.description}</p>
          </div>
        )}

        {/* ✅ Removida a classe 'max-w-5xl mx-auto' do grid para ele se expandir */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {getCategoryName(product.category)}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-orange-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {cart[product.id] > 0 && (
                        <>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="p-2 text-orange-600 hover:text-orange-800 transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="font-semibold">{cart[product.id]}</span>
                        </>
                      )}
                      <button
                        onClick={() => addToCart(product.id)}
                        className="p-2 text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto disponível</h3>
                <p className="text-gray-600">
                  {selectedCategory === 'all'
                    ? 'Não há produtos ativos no momento'
                    : 'Não há produtos nesta categoria'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DigitalMenu;