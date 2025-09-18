import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Edit, Trash2, Package, Tag, Eye } from 'lucide-react';
import CategoryForm from '../Forms/CategoryForm';
import ProductForm from '../Forms/ProductForm';
import type { ProductCategory, Product } from '../../types';

const CategoriesList: React.FC = () => {
    const { categories, products, deleteCategory, mostSoldCategory } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
    const [productToView, setProductToView] = useState<Product | null>(null);

    const handleDeleteCategory = (categoryId: string, productCount: number) => {
        if (productCount > 0) {
            alert('Não é possível excluir uma categoria que possui produtos cadastrados. Remova os produtos primeiro.');
            return;
        }
        if (window.confirm('Tem certeza de que deseja excluir esta categoria?')) {
            deleteCategory(categoryId);
        }
    };

    const handleEditCategory = (category: ProductCategory) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    const handleViewProduct = (product: Product) => {
        setProductToView(product);
    };

    const handleCloseProductView = () => {
        setProductToView(null);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gerenciar Categorias</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-md flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Adicionar Categoria
                </button>
            </div>

            {mostSoldCategory && (
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border-l-4 border-orange-500">
                    <h2 className="text-lg font-bold text-gray-800">Categoria mais vendida:</h2>
                    <p className="text-gray-600">
                        <span className="font-semibold text-orange-600">{mostSoldCategory.name}</span>
                        {' '}com {mostSoldCategory.productCount} produto(s) mais vendidos.
                    </p>
                </div>
            )}

            {/* ✅ Layout responsivo: grade de cards em telas maiores e lista vertical em mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length > 0 ? (
                    categories.map(category => (
                        <div key={category.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {category.isActive ? 'Ativa' : 'Inativa'}
                                    </span>
                                    <button
                                        onClick={() => handleEditCategory(category)}
                                        className="p-1 text-indigo-600 hover:text-indigo-900"
                                        title="Editar"
                                    >
                                        <Edit size={20} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mt-2 flex-grow">{category.description || 'Sem descrição.'}</p>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <details className="group">
                                    <summary className="flex items-center justify-between cursor-pointer list-none py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <span className="font-semibold text-gray-700 flex items-center space-x-2">
                                            <Package className="w-4 h-4 text-gray-500" />
                                            <span>Produtos ({category.productCount})</span>
                                        </span>
                                        <span className="transition-transform group-open:rotate-180">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </span>
                                    </summary>
                                    <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                        {products.filter(p => p.category === category.id).map(product => (
                                            <li key={product.id} className="flex items-center justify-between p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewProduct(product)}>
                                                <span className="text-sm text-gray-700">{product.name}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">R$ {product.price.toFixed(2)}</span>
                                                    <Eye className="w-4 h-4 text-blue-500" />
                                                </div>
                                            </li>
                                        ))}
                                        {category.productCount === 0 && (
                                            <li className="text-center text-sm text-gray-500 p-2">Nenhum produto nesta categoria.</li>
                                        )}
                                    </ul>
                                </details>
                            </div>

                            <div className="mt-4 flex space-x-2 justify-end">
                                <button
                                    onClick={() => handleDeleteCategory(category.id, category.productCount)}
                                    className={`p-2 rounded-lg transition-colors ${category.productCount > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'
                                        }`}
                                    title={category.productCount > 0 ? "Exclua os produtos primeiro" : "Excluir Categoria"}
                                    disabled={category.productCount > 0}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center p-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
                        <p className="text-gray-600 mb-6">Você ainda não possui categorias cadastradas.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
                        >
                            Cadastrar Primeira Categoria
                        </button>
                    </div>
                )}
            </div>

            <CategoryForm
                isOpen={showForm}
                onClose={handleCloseForm}
                category={editingCategory || undefined}
                isEditing={!!editingCategory}
            />

            <ProductForm
                isOpen={!!productToView}
                onClose={handleCloseProductView}
                product={productToView || undefined}
                isViewing={true}
            />
        </div>
    );
};

export default CategoriesList;