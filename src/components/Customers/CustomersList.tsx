import React, { useState } from 'react';
import { useApp } from '../../contexts/AppProvider';
import CustomerForm from '../Forms/CustomerForm';
import {
  Search,
  Plus,
  ShoppingBag,
  DollarSign,
  Edit,
  Eye,
  Wallet,
  User,
  ChevronDown,
  ChevronUp,
  // CreditCard
} from 'lucide-react';
import { Customer, Order } from '../../types';

const CustomersList: React.FC = () => {
  const { customers, orders, loading, error } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const toggleDropdown = (customerId: string) => {
    setOpenDropdown(openDropdown === customerId ? null : customerId);
  };

  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${badges[status]}`;
  };

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status]}`;
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

      {/* Customer List */}
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
              const customerOrders = orders.filter(order => order.customerId === customer.id);
              return (
                <li key={customer.id}>
                  <div className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 flex-shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                          <p className="text-xs text-gray-500 truncate">{customer.whatsapp}</p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span>{customer.completedOrders ?? 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>R$ {(customer.paidSpent ?? 0).toFixed(2)}</span>
                      </div>
                      {customer.is_gift_eligible && (
                        <div className="flex items-center space-x-1 text-orange-500 font-medium">
                          <Wallet className="w-4 h-4" />
                          <span>Brinde</span>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
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
                        onClick={() => toggleDropdown(customer.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                        title="Expandir"
                      >
                        {openDropdown === customer.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {openDropdown === customer.id && (
                    <div className="p-4 sm:p-6 bg-gray-100 border-t border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Últimos Pedidos</h4>
                      {customerOrders.length > 0 ? (
                        <ul className="space-y-4">
                          {customerOrders.map(order => (
                            <li key={order.id} className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center text-sm font-medium text-gray-900 mb-2">
                                <span>Pedido #{order.order_number}</span>
                                <span className="text-gray-500 text-xs">
                                  {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                                    <span>{order.items.length} itens</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                    <span>R$ {order.total.toFixed(2)}</span>
                                  </div>
                                </div>
                                <div className="space-x-2">
                                  <span className={getStatusBadge(order.status)}>{order.status}</span>
                                  <span className={getPaymentStatusBadge(order.paymentStatus)}>{order.paymentStatus}</span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm italic">Este cliente não possui pedidos.</p>
                      )}
                    </div>
                  )}
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
        customer={editingCustomer || viewingCustomer}
        isEditing={!!editingCustomer}
        isViewing={!!viewingCustomer}
      />
    </div>
  );
};

export default CustomersList;