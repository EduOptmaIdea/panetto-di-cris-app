import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Award,
  Target,
  // Clock,
  // CheckCircle,
  // X,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { orders, customers, products } = useApp();
  const navigate = useNavigate();

  // Função para navegar para o cliente selecionado
  const handleViewCustomer = (customerId: string) => {
    navigate('/customers', { state: { viewingCustomerId: customerId } });
  };

  // Cálculos de métricas
  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const currentMonth = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };

    // Pedidos do mês atual
    const currentMonthOrders = orders.filter((order) => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      if (isNaN(orderDate.getTime())) return false;
      return orderDate >= currentMonth.start && orderDate <= currentMonth.end;
    });

    // Faturamento total
    const totalRevenue = orders
      .filter((order) => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0);

    // Faturamento do mês
    const monthlyRevenue = currentMonthOrders
      .filter((order) => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0);

    // Ticket médio
    const paidOrders = orders.filter((order) => order.paymentStatus === 'paid');
    const averageTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Produtos mais vendidos
    const productSales = products
      .map((product) => {
        const totalSold = orders.reduce((sum, order) => {
          const productItems = order.items.filter((item) => item.productId === product.id);
          return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const totalRevenue = orders.reduce((sum, order) => {
          const productItems = order.items.filter((item) => item.productId === product.id);
          return sum + productItems.reduce((itemSum, item) => itemSum + item.total, 0);
        }, 0);

        return {
          name: product.name,
          quantity: totalSold,
          revenue: totalRevenue,
        };
      })
      .sort((a, b) => b.quantity - a.quantity);

    // Vendas por dia (últimos 30 dias)
    const dailySales = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: now,
    }).map((date) => {
      const dayOrders = orders.filter((order) => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        if (isNaN(orderDate.getTime())) return false;
        return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const dayRevenue = dayOrders
        .filter((order) => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.total, 0);

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: format(date, 'dd/MM/yyyy', { locale: ptBR }),
        orders: dayOrders.length,
        revenue: dayRevenue,
      };
    });

    // Status dos pedidos
    const ordersByStatus = [
      { name: 'Pendente', value: orders.filter((o) => o.status === 'pending').length, color: '#f59e0b' },
      { name: 'Confirmado', value: orders.filter((o) => o.status === 'confirmed').length, color: '#3b82f6' },
      { name: 'Preparando', value: orders.filter((o) => o.status === 'preparing').length, color: '#f97316' },
      { name: 'Pronto', value: orders.filter((o) => o.status === 'ready').length, color: '#10b981' },
      { name: 'Entregue', value: orders.filter((o) => o.status === 'delivered').length, color: '#6b7280' },
      { name: 'Cancelado', value: orders.filter((o) => o.status === 'cancelled').length, color: '#ef4444' },
    ].filter((item) => item.value > 0);

    // Canais de venda
    const salesChannels = [
      { name: 'Direto', value: orders.filter((o) => o.salesChannel === 'direct').length, color: '#8b5cf6' },
      { name: 'WhatsApp', value: orders.filter((o) => o.salesChannel === 'whatsapp').length, color: '#10b981' },
      { name: '99Food', value: orders.filter((o) => o.salesChannel === '99food').length, color: '#f59e0b' },
      { name: 'iFood', value: orders.filter((o) => o.salesChannel === 'ifood').length, color: '#ef4444' },
    ].filter((item) => item.value > 0);

    // Clientes mais ativos
    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map((customer) => ({
        id: customer.id,
        name: customer.name,
        orders: customer.totalOrders,
        spent: customer.totalSpent,
      }));

    return {
      totalRevenue,
      monthlyRevenue,
      averageTicket,
      totalOrders: orders.length,
      monthlyOrders: currentMonthOrders.length,
      totalCustomers: customers.length,
      activeProducts: products.filter((p) => p.isActive).length,
      productSales: productSales.slice(0, 10),
      dailySales,
      ordersByStatus,
      salesChannels,
      topCustomers,
    };
  }, [orders, customers, products]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }> = ({ title, value, icon: Icon, color, change, changeType = 'positive' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p
              className={`text-sm mt-1 font-medium ${changeType === 'positive'
                ? 'text-green-600'
                : changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-600'
                }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do desempenho da sua paneteria</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Faturamento Total"
          value={`R$ ${analytics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="from-green-500 to-green-600"
          change="+12% este mês"
        />
        <StatCard
          title="Pedidos Totais"
          value={analytics.totalOrders}
          icon={ShoppingCart}
          color="from-blue-500 to-blue-600"
          change="+8% este mês"
        />
        <StatCard
          title="Ticket Médio"
          value={`R$ ${analytics.averageTicket.toFixed(2)}`}
          icon={Target}
          color="from-purple-500 to-purple-600"
          change="+5% este mês"
        />
        <StatCard
          title="Clientes Ativos"
          value={analytics.totalCustomers}
          icon={Users}
          color="from-orange-500 to-orange-600"
          change="+15% este mês"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Dia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas dos Últimos 30 Dias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                labelFormatter={(label, payload) => {
                  const data = payload?.[0]?.payload;
                  return data?.fullDate || label;
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `R$ ${value.toFixed(2)}` : value,
                  name === 'revenue' ? 'Faturamento' : 'Pedidos',
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                fill="#fed7aa"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status dos Pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Pedidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.ordersByStatus}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analytics.ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.productSales} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value: number) => [value, 'Quantidade']} />
              <Bar dataKey="quantity" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Canais de Venda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Canais de Venda</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.salesChannels}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analytics.ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Clientes</h3>
        <div className="space-y-4">
          {analytics.topCustomers.map((customer, index) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleViewCustomer(customer.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.orders} pedidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">R$ {customer.spent.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total gasto</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo Mensal */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Resumo do Mês Atual</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold">{analytics.monthlyOrders}</p>
            <p className="text-orange-100">Pedidos este mês</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold">R$ {analytics.monthlyRevenue.toFixed(2)}</p>
            <p className="text-orange-100">Faturamento este mês</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-8 h-8" />
            </div>
            <p className="text-2xl font-bold">{analytics.activeProducts}</p>
            <p className="text-orange-100">Produtos ativos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;