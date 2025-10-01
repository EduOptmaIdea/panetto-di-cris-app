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
  Trash2,
  Filter,
  SortAsc,
  Package,
  ShoppingBag,
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
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      list = list.filter(product =>
        product.name.toLowerCase().includes(lowercasedTerm) ||
        (product.description && product.description.toLowerCase().includes(lowercasedTerm))
      );
    }
    if (filterCategory !== 'all') {
      list = list.filter(product => product.category === filterCategory);
    }
    if (filterStatus !== 'all') {
      list = list.filter(product =>
        filterStatus === 'active' ? product.isActive : !product.isActive
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') {
        const catA = categories.find(c => c.id === a.category)?.name || '';
        const catB = categories.find(c => c.id === b.category)?.name || '';
        return catA.localeCompare(catB);
      }
      return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
    });
    return list;
  }, [products, searchTerm, filterCategory, filterStatus, sortBy, categories]);

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'N/A';
  };

  const handleEdit = (product: Product) => {
    setViewingProduct(null);
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
      await deleteProduct(productToDelete.id);
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
    }
  };

  const hasAssociatedOrders = (productId: string) => {
    return orders.some(order =>
      order.items.some(item => item.productId === productId)
    );
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const defaultImage = 'https://xhxywfrpokrvszbasihv.supabase.co/storage/v1/object/public/product-media/panetto-imagem-nao-disponivel.webp';

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-md flex items-center justify-center"
        >
          <Plus size={20} className="mr-2" />
          Cadastrar Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar por nome ou descrição..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 appearance-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">Todas as Categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 appearance-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <SortAsc className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border-gray-300 rounded-lg">
          <option value="active">Status (Ativos primeiro)</option>
          <option value="name">Nome (A-Z)</option>
          <option value="category">Categoria</option>
        </select>
      </div>

      {/* --- LISTA PARA MOBILE --- */}
      <div className="space-y-4 md:hidden">
        {filteredAndSortedProducts.length > 0 ? (
          filteredAndSortedProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500">{getCategoryName(product.category)}</p>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
                </div>
                <img className="h-14 w-14 rounded-md object-cover flex-shrink-0 ml-2" src={product.image || defaultImage} alt={product.name} />
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="font-bold text-lg text-orange-600">{formatCurrency(product.price)}</span>
                  <div className="flex items-center text-gray-500"><ShoppingBag size={14} className="mr-1" /> {product.totalSold || 0}</div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <button onClick={() => handleView(product)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye size={20} /></button>
                  <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit size={20} /></button>
                  <button onClick={() => handleDelete(product)} disabled={hasAssociatedOrders(product.id)} className="p-2 text-red-500 disabled:text-gray-400 hover:bg-red-100 rounded-lg disabled:cursor-not-allowed"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          </div>
        )}
      </div>

      {/* --- TABELA PARA DESKTOP --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto hidden md:block">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12"><img className="h-12 w-12 rounded-md object-cover" src={product.image || defaultImage} alt={product.name} /></div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{getCategoryName(product.category)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <ShoppingBag size={16} className="text-gray-400 mr-1" />
                    {product.totalSold || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.isActive ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    <button onClick={() => handleView(product)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg" title="Visualizar"><Eye size={20} /></button>
                    <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg" title="Editar"><Edit size={20} /></button>
                    <button onClick={() => handleDelete(product)} disabled={hasAssociatedOrders(product.id)} className="p-2 disabled:text-gray-400 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg" title={hasAssociatedOrders(product.id) ? "Produto com pedidos associados" : "Excluir"}><Trash2 size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductForm isOpen={showForm} onClose={handleCloseForm} product={editingProduct ?? undefined} isEditing={!!editingProduct} />
      <ProductView isOpen={!!viewingProduct} onClose={handleCloseView} product={viewingProduct ?? undefined} onEdit={handleEdit} />

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-4">Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação é irreversível.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowDeleteConfirmation(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;