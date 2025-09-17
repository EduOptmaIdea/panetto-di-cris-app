import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProductForm from '../Forms/ProductForm';
import {
  Search,
  Plus, // ✅ Adiciona o ícone de '+'
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
  const { products, categories, orders, deleteProduct, updateProduct } = useApp();
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

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setViewingProduct(null);
  };

  const handleDeleteClick = (product: Product) => {
    const hasOrders = orders.some(order => order.items.some(item => item.productId === product.id));

    if (hasOrders) {
      alert('Este produto não pode ser excluído pois há pedidos associados a ele.');
      return;
    }

    setProductToDelete(product);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { isActive: !product.isActive });
    } catch (error) {
      console.error('Erro ao alternar status do produto:', error);
      alert('Erro ao alternar status do produto. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and 'New Product' button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {/* ✅ Botão 'Novo Produto' movido para a barra de filtros */}
            <button
              onClick={() => {
                setEditingProduct(null);
                setViewingProduct(null);
                setShowForm(true);
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            // ... (product card) ...
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image Placeholder */}
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

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <Tag className="w-3 h-3 mr-1" />
                        {getCategoryName(product.category)}
                      </span>
                      {product.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{product.totalSold} vendidos</span>
                    </div>

                    {product.weight && (
                      <span>{product.weight}g</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t mt-3">
                  <button
                    onClick={() => handleView(product)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors ${product.isActive ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    {product.isActive ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Inativar</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Ativar</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
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
              {/* ✅ Botão removido daqui, pois foi movido para a barra de filtros */}
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