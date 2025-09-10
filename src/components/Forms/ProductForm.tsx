import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, Package, DollarSign, FileText, Tag, Weight, Gift } from 'lucide-react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  isEditing?: boolean;
  isViewing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  isEditing = false,
  isViewing = false
}) => {
  const { addProduct, updateProduct, categories } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || '',
    image: product?.image || '',
    weight: product?.weight || '',
    customPackaging: product?.customPackaging || false,
    isActive: product?.isActive !== undefined ? product.isActive : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price.toString()),
        weight: formData.weight ? parseInt(formData.weight.toString()) : undefined,
      };

      if (isEditing && product) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      
      onClose();
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        image: '',
        weight: '',
        customPackaging: false,
        isActive: true,
      });
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isViewing ? 'Visualizar Produto' : isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4" />
              <span>Nome do Produto *</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isViewing}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: Panetone Tradicional"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              <span>Descrição *</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isViewing}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Descreva o produto, ingredientes, características..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              <span>Categoria *</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isViewing}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Preço *</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={isViewing}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Weight className="w-4 h-4" />
                <span>Peso (g)</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                disabled={isViewing}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4" />
              <span>URL da Imagem</span>
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              disabled={isViewing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="customPackaging"
                id="customPackaging"
                checked={formData.customPackaging}
                disabled={isViewing}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="customPackaging" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Gift className="w-4 h-4" />
                <span>Embalagem personalizada disponível</span>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                disabled={isViewing}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Produto ativo (visível no menu)
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            {!isViewing && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}
                </button>
              </>
            )}
            {isViewing && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Fechar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;