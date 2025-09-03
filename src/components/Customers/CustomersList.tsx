import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Search, 
  Plus, 
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Edit,
  Eye
} from 'lucide-react';

const CustomersList: React.FC = () => {
  const { customers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.whatsapp.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie sua base de clientes</p>
        </div>
        
        <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{customer.name}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{customer.whatsapp}</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                    
                    {customer.deliveryPreferences && (
                      <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        Preferência: {customer.deliveryPreferences}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-xs font-medium">Pedidos</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{customer.totalOrders}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs font-medium">Gasto</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      R$ {customer.totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              {customer.observations && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Observações: </span>
                    {customer.observations}
                  </p>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca'
                  : 'Você ainda não possui clientes cadastrados'}
              </p>
              <button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200">
                Cadastrar Primeiro Cliente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersList;