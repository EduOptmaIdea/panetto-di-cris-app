import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { orders, customers, products } = useApp();

  const stats = [
    {
      title: 'Pedidos do Dia',
      value: orders.filter(order => 
        new Date(order.orderDate).toDateString() === new Date().toDateString()
      ).length,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
    },
    {
      title: 'Faturamento',
      value: `R$ ${orders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      change: '+8%',
    },
    {
      title: 'Clientes',
      value: customers.length,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      change: '+5%',
    },
    {
      title: 'Produtos',
      value: products.filter(p => p.isActive).length,
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      change: '+2%',
    },
  ];

  const recentOrders = orders.slice(-5).reverse();

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
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

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1 font-medium">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recentes</h3>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">R$ {order.total.toFixed(2)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum pedido ainda</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">Novo Pedido</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">Cadastrar Cliente</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <Package className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-700">Adicionar Produto</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-700">Ver Relatórios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral dos Pedidos</h3>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { status: 'pending', label: 'Pendentes', icon: Clock, color: 'text-yellow-600' },
            { status: 'confirmed', label: 'Confirmados', icon: CheckCircle, color: 'text-blue-600' },
            { status: 'preparing', label: 'Preparando', icon: AlertCircle, color: 'text-orange-600' },
            { status: 'ready', label: 'Prontos', icon: CheckCircle, color: 'text-green-600' },
            { status: 'delivered', label: 'Entregues', icon: CheckCircle, color: 'text-gray-600' },
            { status: 'cancelled', label: 'Cancelados', icon: AlertCircle, color: 'text-red-600' },
          ].map(({ status, label, icon: StatusIcon, color }) => {
            const count = orders.filter(order => order.status === status).length;
            return (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <StatusIcon className={`w-8 h-8 ${color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;