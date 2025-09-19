import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Package, Search } from 'lucide-react';

const DigitalMenu: React.FC = () => {
  const { products, categories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const productCategory = categories.find(cat => cat.id === product.category);
      const categoryIsActive = productCategory?.isActive ?? true;
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

      return product.isActive && matchesCategory && categoryIsActive && matchesSearch;
    });
  }, [products, categories, selectedCategory, searchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/menu/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-orange-600">Panetto di Cris</h1>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por produto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <nav className="sticky top-[72px] bg-white shadow-sm p-2 z-10">
        <div className="flex flex-wrap gap-2 max-w-7xl mx-auto">
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
              className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === category.id ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {selectedCategory !== 'all' && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200 shadow-sm">
            <h2 className="text-xl font-bold text-orange-800 mb-1">{categories.find(c => c.id === selectedCategory)?.name}</h2>
            <p className="text-sm text-gray-700">{categories.find(c => c.id === selectedCategory)?.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleProductClick(product.id)}
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <span className="text-xl font-bold text-orange-600 mt-2 block">
                    {formatCurrency(product.price)}
                  </span>
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
                    : 'Não há produtos ativos nesta categoria'}
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