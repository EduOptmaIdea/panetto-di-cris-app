import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, User, Phone, MapPin, FileText } from 'lucide-react';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
  isEditing?: boolean;
  isViewing?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  customer,
  isEditing = false,
  isViewing = false
}) => {
  const { addCustomer, updateCustomer } = useApp();
  const [loading, setLoading] = useState(false);

  // Use useEffect to keep formData in sync with the customer prop
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    whatsapp: customer?.whatsapp || '',
    address: customer?.address || '',
    observations: customer?.observations || '',
    deliveryPreferences: customer?.deliveryPreferences || '',
  });

  useEffect(() => {
    setFormData({
      name: customer?.name || '',
      whatsapp: customer?.whatsapp || '',
      address: customer?.address || '',
      observations: customer?.observations || '',
      deliveryPreferences: customer?.deliveryPreferences || '',
    });
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && customer) {
        await updateCustomer(customer.id, formData);
      } else {
        await addCustomer(formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    // ... rest of the component is unchanged
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isViewing ? 'Visualizar Cliente' : isEditing ? 'Editar Cliente' : 'Novo Cliente'}
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
              <User className="w-4 h-4" />
              <span>Nome Completo *</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isViewing}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              <span>WhatsApp *</span>
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              disabled={isViewing}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Endereço *</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isViewing}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              <span>Preferências de Entrega</span>
            </label>
            <input
              type="text"
              name="deliveryPreferences"
              value={formData.deliveryPreferences}
              onChange={handleChange}
              disabled={isViewing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: Portão azul, interfone 123"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              <span>Observações</span>
            </label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              disabled={isViewing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Observações gerais sobre o cliente"
            />
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

export default CustomerForm;