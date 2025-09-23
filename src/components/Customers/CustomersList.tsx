import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import CustomerForm from '../Forms/CustomerForm';
import CustomerView from './CustomerView';
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  User,
} from 'lucide-react';
import { Customer } from '../../types/index';

const CustomersList: React.FC = () => {
  const { customers, orders, loading, error, deleteCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.whatsapp && customer.whatsapp.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  const handleCloseView = () => {
    setViewingCustomer(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer(customerToDelete.id);
        setShowDeleteConfirmation(false);
        setCustomerToDelete(null);
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
      }
    }
  };

  const hasAssociatedOrders = (customerId: string) => {
    return orders.some(order => order.customerId === customerId);
  };

  return (
    <div className="space-y-6">
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center">
          <span className="block sm:inline">Erro ao carregar clientes: {error}</span>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => {
              const hasOrders = hasAssociatedOrders(customer.id);
              return (
                <li key={customer.id}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 hover:bg-gray-50">
                    <div className="flex-1 min-w-0 flex items-center space-x-3 mb-2 sm:mb-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500 truncate">{customer.whatsapp}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-auto sm:ml-0">
                      <button
                        onClick={() => handleView(customer)}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-gray-100"
                        title="Ver detalhes"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-gray-100"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        disabled={hasOrders}
                        className={`p-2 rounded-lg transition-colors ${hasOrders ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                        title={hasOrders ? "Não é possível excluir cliente com pedidos associados" : "Excluir Cliente"}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
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
      )}
      <CustomerForm
        isOpen={showForm}
        onClose={handleCloseForm}
        customer={editingCustomer ?? undefined}
        isEditing={!!editingCustomer}
      />
      <CustomerView
        isOpen={!!viewingCustomer}
        onClose={handleCloseView}
        customer={viewingCustomer ?? undefined}
      />
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-4">Tem certeza de que deseja excluir o cliente "{customerToDelete?.name}"? Esta ação é irreversível.</p>
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

export default CustomersList;