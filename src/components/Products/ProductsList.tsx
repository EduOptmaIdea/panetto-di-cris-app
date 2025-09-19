import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import ProductForm from '../Forms/ProductForm';
import ProductView from './ProductView';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Tag,
  Package,
  Trash2,
  Filter,
  SortAsc,
} from 'lucide-react';
import type { Product } from '../../types/index';

const ProductsList: React.FC = () => {
  const { products, categories, deleteProduct, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    // 1. Filtragem por termo de busca
    list = list.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Filtragem por categoria
    if (filterCategory !== 'all') {
      list = list.filter(product => product.category === filterCategory);
    }

    // 3. Filtragem por status (ativo/inativo)
    if (filterStatus !== 'all') {
      list = list.filter(product =>
        filterStatus === 'active' ? product.isActive : !product.isActive
      );
    }

    // 4. Ordenação
    // Ordena primeiro por status (ativos primeiro)
    list.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));

    // Aplica a ordenação secundária por nome ou categoria
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'category') {
      list.sort((a, b) => {
        const catA = categories.find(c => c.id === a.category)?.name || '';
        const catB = categories.find(c => c.id === b.category)?.name || '';
        return catA.localeCompare(catB);
      });
    }

    return list;
  }, [products, searchTerm, filterCategory, filterStatus, sortBy, categories]);

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
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleCloseView = () => {
    setViewingProduct(null);
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

  const hasAssociatedOrders = (productId: string) => {
    return orders.some(order =>
      order.items.some(item => item.productId === productId)
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-md flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Cadastrar Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Campo de Busca */}
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

          {/* Filtro por Categoria */}
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

          {/* Filtro por Status */}
          <div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Opções de Ordenação */}
      <div className="flex items-center space-x-2 mb-6">
        <SortAsc className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border-gray-300 rounded-lg"
        >
          <option value="active">Status (Ativos primeiro)</option>
          <option value="name">Nome (A-Z)</option>
          <option value="category">Categoria</option>
        </select>
      </div>

      {/* Seção da Listagem de Produtos (Layout de Lista) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredAndSortedProducts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {/* Cabeçalho da Tabela */}
            <div className="hidden lg:flex items-center justify-between p-4 bg-gray-50 text-sm font-semibold text-gray-600">
              <div className="flex-1">Produto</div>
              <div className="w-40 text-right">Preço</div>
              <div className="w-24 text-center">Vendas</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-40 text-right">Ações</div>
            </div>

            {filteredAndSortedProducts.map(product => (
              <div key={product.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 hover:bg-gray-50 transition-colors">

                {/* Informações do Produto (Nome, Categoria, Imagem) */}
                <div className="flex items-center space-x-4 flex-1 mb-4 lg:mb-0">
                  <img
                    src={product.image || 'https://via.placeholder.com/64'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{getCategoryName(product.category)}</p>
                  </div>
                </div>

                {/* Preço (Mobile e Desktop) */}
                <div className="w-40 text-left lg:text-right font-semibold text-gray-900 mb-2 lg:mb-0">
                  <span className="lg:hidden font-medium">Preço: </span>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </div>

                {/* Vendas (Mobile e Desktop) */}
                <div className="w-24 text-left lg:text-center text-gray-600 mb-2 lg:mb-0">
                  <span className="lg:hidden font-medium">Vendas: </span>{product.totalSold}
                </div>

                {/* Status (Mobile e Desktop) */}
                <div className="w-24 text-left lg:text-center mb-4 lg:mb-0">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex w-40 justify-end space-x-2">
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
                    disabled={hasAssociatedOrders(product.id)}
                    className={`p-2 rounded-lg transition-colors ${hasAssociatedOrders(product.id) ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-700 hover:bg-red-100'}`}
                    title={hasAssociatedOrders(product.id) ? "Não é possível excluir produto com pedidos associados" : "Excluir"}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
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
        product={editingProduct ?? undefined}
        isEditing={!!editingProduct}
      />

      <ProductView
        isOpen={!!viewingProduct}
        onClose={handleCloseView}
        product={viewingProduct ?? undefined}
      />

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