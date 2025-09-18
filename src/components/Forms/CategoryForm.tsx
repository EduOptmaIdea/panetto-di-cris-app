import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X } from 'lucide-react';
import type { ProductCategory } from '../../types';

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    category?: ProductCategory;
    isEditing?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    isOpen,
    onClose,
    category,
    isEditing = false,
}) => {
    const { addCategory, updateCategory } = useApp();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        isActive: category?.isActive ?? true,
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
                isActive: category.isActive,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                isActive: true,
            });
        }
    }, [category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing && category) {
                await updateCategory(category.id, formData);
            } else {
                await addCategory(formData);
            }
            onClose();
        } catch (err) {
            console.error('Failed to save category:', err);
            // Você pode adicionar um estado de erro aqui para exibir uma mensagem
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4">
                    {isEditing ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nome
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Descrição
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center">
                            <input
                                id="isActive"
                                name="isActive"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">
                                Categoria ativa (visível no menu)
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Adicionar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;