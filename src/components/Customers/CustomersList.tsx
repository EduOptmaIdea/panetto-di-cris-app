import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import CustomerForm from '../Forms/CustomerForm';
import {
  Search,
  Plus,
  ShoppingBag,
  DollarSign,
  Edit,
  Eye,
  Wallet,
  User
} from 'lucide-react';
import { Customer } from '../../types';

const CustomersList: React.FC = () => {
  const { customers, loading, error } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.whatsapp && customer.whatsapp.includes(searchTerm))
  );

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setViewingCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie a sua base de clientes.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border-0 py-2 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
            />
          </div>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setViewingCustomer(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Customer Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center">
          <span className="block sm:inline">Erro ao carregar clientes: {error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                <div className="relative">
                  {/* Action Buttons */}
                  <div className="absolute top-0 right-0 flex space-x-2">
                    <button
                      onClick={() => handleView(customer)}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Customer Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.whatsapp}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-center">
                      <ShoppingBag className="w-4 h-4 text-gray-500 mr-2" />
                      <span>{customer.totalOrders ?? 0} Pedidos</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                      <span>R$ {(customer.totalSpent ?? 0).toFixed(2)} gastos</span>
                    </div>
                    {customer.is_gift_eligible && (
                      <div className="flex items-center text-orange-500 font-medium">
                        <Wallet className="w-4 h-4 mr-2" />
                        <span>Elegível para Brinde!</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 text-center">
                    Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                  </div>
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
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
                >
                  Cadastrar Primeiro Cliente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <CustomerForm
        isOpen={showForm}
        onClose={handleCloseForm}
        customer={editingCustomer || viewingCustomer}
        isEditing={!!editingCustomer}
        isViewing={!!viewingCustomer}
      />
    </div>
  );
};

export default CustomersList;