import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import CategoryForm from '../Forms/CategoryForm';
import type { ProductCategory } from '../../types';

const CategoryManagement: React.FC = () => {
    const { categories, deleteCategory, mostSoldCategory } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

    const handleEdit = (category: ProductCategory) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gerenciar Categorias</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-md flex items-center"
                >
                    <Plus className="mr-2" size={20} />
                    Adicionar Categoria
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {category.name}
                                    {mostSoldCategory?.id === category.id && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                            Mais Vendida
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.description || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {category.isActive ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : (
                                        <XCircle className="text-red-500" size={20} />
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(category.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CategoryForm
                isOpen={showForm}
                onClose={handleCloseForm}
                category={editingCategory || undefined}
                isEditing={!!editingCategory}
            />
        </div>
    );
};

export default CategoryManagement;