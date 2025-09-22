import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { Customer } from '../../types/index';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  isEditing?: boolean;
}

// Função para formatar o endereço como string para o banco de dados
const formatAddressToString = (addressData: {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  notes?: string;
}): string => {
  const parts = [
    addressData.street,
    addressData.number,
    addressData.neighborhood,
    addressData.city,
    addressData.state,
    addressData.zipcode
  ];
  if (addressData.notes) {
    parts.push(addressData.notes);
  }
  return parts.join(', ');
};

// Função para parsear a string de endereço do banco de dados para o objeto do formulário
const parseAddressFromString = (addressString: string | null): {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  notes?: string;
} => {
  if (!addressString) {
    return {
      street: '',
      number: '',
      neighborhood: '',
      city: 'Goiânia',
      state: 'GO',
      zipcode: '74000-000',
      notes: '',
    };
  }

  const parts = addressString.split(', ');
  return {
    street: parts[0] || '',
    number: parts[1] || '',
    neighborhood: parts[2] || '',
    city: parts[3] || 'Goiânia',
    state: parts[4] || 'GO',
    zipcode: parts[5] || '74000-000',
    notes: parts.length > 6 ? parts.slice(6).join(', ') : '',
  };
};

const CustomerForm: React.FC<CustomerFormProps> = ({
  isOpen,
  onClose,
  customer,
  isEditing = false,
}) => {
  const { addCustomer, updateCustomer } = useApp();
  const [loading, setLoading] = useState(false);

  // Estado interno do formulário com campos separados para o endereço
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    whatsapp: customer?.whatsapp || '',
    email: customer?.email || '',
    // Inicializa os campos de endereço
    street: '',
    number: '',
    neighborhood: '',
    city: 'Goiânia',
    state: 'GO',
    zipcode: '74000-000',
    notes: '',
    observations: customer?.observations || '',
    deliveryPreferences: customer?.deliveryPreferences || '',
  });

  useEffect(() => {
    if (customer) {
      const parsedAddress = parseAddressFromString(customer.address);
      setFormData({
        name: customer.name || '',
        whatsapp: customer.whatsapp || '',
        email: customer.email || '',
        street: parsedAddress.street,
        number: parsedAddress.number,
        neighborhood: parsedAddress.neighborhood,
        city: parsedAddress.city,
        state: parsedAddress.state,
        zipcode: parsedAddress.zipcode,
        notes: parsedAddress.notes || '',
        observations: customer.observations || '',
        deliveryPreferences: customer.deliveryPreferences || '',
      });
    } else {
      setFormData(prev => ({
        ...prev,
        name: '',
        whatsapp: '',
        email: '',
        street: '',
        number: '',
        neighborhood: '',
        city: 'Goiânia',
        state: 'GO',
        zipcode: '74000-000',
        notes: '',
        observations: '',
        deliveryPreferences: '',
      }));
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Formata o endereço como string antes de enviar
      const formattedAddress = formatAddressToString({
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        notes: formData.notes,
      });

      if (isEditing && customer) {
        await updateCustomer(customer.id, {
          name: formData.name,
          whatsapp: formData.whatsapp,
          email: formData.email,
          address: formattedAddress,
          observations: formData.observations,
          deliveryPreferences: formData.deliveryPreferences,
        });
      } else {
        await addCustomer({
          name: formData.name,
          whatsapp: formData.whatsapp,
          email: formData.email,
          address: formattedAddress,
          observations: formData.observations,
          deliveryPreferences: formData.deliveryPreferences,
        });
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Aplica máscara ao CEP
    if (name === 'zipcode') {
      const numericValue = value.replace(/\D/g, '');
      const maskedValue = numericValue.length === 8
        ? `${numericValue.substring(0, 5)}-${numericValue.substring(5, 8)}`
        : numericValue;
      setFormData(prev => ({
        ...prev,
        [name]: maskedValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Endereço *</span>
            </label>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Endereço</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rua *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Rua, Av., Alameda, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0 para S/N"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro/Setor *
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Goiânia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="GO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="74000-000"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Apto 101, Bloco A"
                />
              </div>
            </div>
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Observações gerais sobre o cliente"
            />
          </div>

          <div className="flex space-x-3 pt-4">
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;