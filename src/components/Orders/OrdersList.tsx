import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit,
  Calendar,
  DollarSign,
  Truck,
  User
} from 'lucide-react';

const OrdersList: React.FC = () => {
  const { orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Pronto',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPaymentLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      cancelled: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getChannelLabel = (channel: string) => {
    const labels = {
      direct: 'Direto',
      whatsapp: 'WhatsApp',
      '99food': '99Food',
      ifood: 'iFood',
    };
    return labels[channel as keyof typeof labels] || channel;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">Gerencie todos os pedidos da sua paneteria</p>
        </div>
        
        <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Novo Pedido</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente ou número do pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Pronto</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">#{order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentBadge(order.paymentStatus)}`}>
                            {getPaymentLabel(order.paymentStatus)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{order.customer.name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.orderDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4" />
                            <span>{order.deliveryMethod === 'delivery' ? 'Entrega' : 'Retirada'}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {getChannelLabel(order.salesChannel)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 flex items-center">
                          <DollarSign className="w-5 h-5" />
                          R$ {order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Order Items Summary */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <span key={index} className="text-xs bg-white px-2 py-1 rounded border">
                            {item.quantity}x {item.product.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{order.items.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>Ver</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 px-3 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Você ainda não possui pedidos cadastrados'}
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200">
              Criar Primeiro Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;