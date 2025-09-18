import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProductForm from '../Forms/ProductForm';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Tag,
  TrendingUp,
  Package,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { Product } from '../../types/index';

const ProductsList: React.FC = () => {
  const { products, categories, deleteProduct, updateProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setViewingProduct(null);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setShowForm(true);
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { isActive: !product.isActive });
    } catch (error) {
      console.error('Erro ao alternar status do produto:', error);
      alert('Falha ao atualizar o status do produto. Tente novamente.');
    }
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setShowDeleteConfirmation(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Falha ao excluir o produto. Tente novamente.');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setViewingProduct(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-md flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Cadastrar Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome do produto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 appearance-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {product.image && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover object-center"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-0.5 text-sm font-medium text-orange-800">
                        <Tag size={12} className="mr-1" />
                        {getCategoryName(product.category)}
                      </span>
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={16} />
                    <span>Vendido: {product.totalSold}</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${product.isActive ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {product.isActive ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    <span>{product.isActive ? 'Ativo' : 'Inativo'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-200">
                <button
                  onClick={() => handleToggleActive(product)}
                  className={`text-xs font-semibold uppercase ${product.isActive ? 'text-red-500' : 'text-green-500'
                    } hover:underline`}
                >
                  {product.isActive ? 'Desativar' : 'Ativar'}
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(product)}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você ainda não possui produtos cadastrados'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
              >
                Cadastrar Primeiro Produto
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductForm
        isOpen={showForm}
        onClose={handleCloseForm}
        product={(editingProduct || viewingProduct) ?? undefined}
        isEditing={!!editingProduct}
        isViewing={!!viewingProduct}
      />

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-4">Tem certeza de que deseja excluir o produto "{productToDelete?.name}"? Esta ação é irreversível.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;