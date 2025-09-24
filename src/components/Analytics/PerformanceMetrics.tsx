import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { TrendingUp, TrendingDown, Minus, Target, Clock, CheckCircle } from 'lucide-react';
import { /*format,*/ subDays, startOfDay, endOfDay } from 'date-fns';
// import { ptBR } from 'date-fns/locale';

const PerformanceMetrics: React.FC = () => {
  const { orders } = useApp();

  // Calcular métricas de performance
  const calculateMetrics = () => {
    const now = new Date();
    const yesterday = subDays(now, 1);
    const lastWeek = subDays(now, 7);
    const lastMonth = subDays(now, 30);

    // Pedidos de hoje
    const todayOrders = orders.filter(order => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate >= startOfDay(now) && orderDate <= endOfDay(now);
    });

    // Pedidos de ontem
    const yesterdayOrders = orders.filter(order => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate >= startOfDay(yesterday) && orderDate <= endOfDay(yesterday);
    });

    // Pedidos da última semana
    const weekOrders = orders.filter(order => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate >= lastWeek;
    });

    // Pedidos do mês passado
    const monthOrders = orders.filter(order => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate >= lastMonth;
    });

    // Taxa de conversão (pedidos confirmados vs total)
    const confirmedOrders = orders.filter(order =>
      ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.currentStatus)
    );
    const conversionRate = orders.length > 0 ? (confirmedOrders.length / orders.length) * 100 : 0;

    // Tempo médio de preparo (estimativa baseada em currentStatus)
    const deliveredOrders = orders.filter(order => order.currentStatus === 'delivered' && order.completedAt);
    const avgPreparationTime = deliveredOrders.length > 0
      ? deliveredOrders.reduce((sum, order) => {
        const start = new Date(order.orderDate!);
        const end = new Date(order.completedAt!);
        return sum + (end.getTime() - start.getTime());
      }, 0) / deliveredOrders.length / (1000 * 60) // em minutos
      : 0;

    // Faturamento hoje vs ontem
    const todayRevenue = todayOrders
      .filter(order => order.currentPaymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0);

    const yesterdayRevenue = yesterdayOrders
      .filter(order => order.currentPaymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0);

    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    // Taxa de cancelamento
    const cancelledOrders = orders.filter(order => order.currentStatus === 'cancelled');
    const cancellationRate = orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0;

    return {
      todayOrders: todayOrders.length,
      yesterdayOrders: yesterdayOrders.length,
      weekOrders: weekOrders.length,
      monthOrders: monthOrders.length,
      todayRevenue,
      yesterdayRevenue,
      revenueChange,
      conversionRate,
      cancellationRate,
      avgPreparationTime
    };
  };

  const metrics = calculateMetrics();

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    format?: 'number' | 'currency' | 'percentage' | 'time';
  }> = ({ title, value, change, changeLabel, icon: Icon, color, format = 'number' }) => {
    const formatValue = (val: string | number) => {
      if (typeof val === 'string') return val;

      switch (format) {
        case 'currency':
          return `R$ ${val.toFixed(2)}`;
        case 'percentage':
          return `${val.toFixed(1)}%`;
        case 'time':
          return `${Math.round(val)} min`;
        default:
          return val.toString();
      }
    };

    const getChangeIcon = () => {
      if (change === undefined) return null;
      if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
      if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
      return <Minus className="w-4 h-4 text-gray-600" />;
    };

    const getChangeColor = () => {
      if (change === undefined) return 'text-gray-600';
      if (change > 0) return 'text-green-600';
      if (change < 0) return 'text-red-600';
      return 'text-gray-600';
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="text-sm font-medium">
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatValue(value)}
          </p>
          <p className="text-sm text-gray-600">{title}</p>
          {changeLabel && (
            <p className={`text-xs mt-1 ${getChangeColor()}`}>
              {changeLabel}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Métricas de Performance</h2>
        <p className="text-gray-600">Acompanhe o desempenho em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Pedidos Hoje"
          value={metrics.todayOrders}
          change={metrics.yesterdayOrders > 0 ?
            ((metrics.todayOrders - metrics.yesterdayOrders) / metrics.yesterdayOrders) * 100 : 0}
          changeLabel="vs ontem"
          icon={Target}
          color="from-blue-500 to-blue-600"
        />

        <MetricCard
          title="Faturamento Hoje"
          value={metrics.todayRevenue}
          change={metrics.revenueChange}
          changeLabel="vs ontem"
          icon={TrendingUp}
          color="from-green-500 to-green-600"
          format="currency"
        />

        <MetricCard
          title="Taxa de Conversão"
          value={metrics.conversionRate}
          icon={CheckCircle}
          color="from-purple-500 to-purple-600"
          format="percentage"
        />

        <MetricCard
          title="Tempo Médio de Preparo"
          value={metrics.avgPreparationTime}
          icon={Clock}
          color="from-orange-500 to-orange-600"
          format="time"
        />

        <MetricCard
          title="Taxa de Cancelamento"
          value={metrics.cancellationRate}
          icon={TrendingDown}
          color="from-red-500 to-red-600"
          format="percentage"
        />

        <MetricCard
          title="Pedidos Esta Semana"
          value={metrics.weekOrders}
          icon={Target}
          color="from-indigo-500 to-indigo-600"
        />
      </div>

      {/* Alertas de Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas de Performance</h3>
        <div className="space-y-3">
          {metrics.cancellationRate > 10 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Taxa de cancelamento alta</p>
                <p className="text-xs text-red-600">
                  {metrics.cancellationRate.toFixed(1)}% dos pedidos foram cancelados
                </p>
              </div>
            </div>
          )}

          {metrics.avgPreparationTime > 60 && (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Tempo de preparo elevado</p>
                <p className="text-xs text-yellow-600">
                  Média de {Math.round(metrics.avgPreparationTime)} minutos por pedido
                </p>
              </div>
            </div>
          )}

          {metrics.conversionRate < 80 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">Taxa de conversão baixa</p>
                <p className="text-xs text-orange-600">
                  Apenas {metrics.conversionRate.toFixed(1)}% dos pedidos são confirmados
                </p>
              </div>
            </div>
          )}

          {metrics.cancellationRate <= 10 && metrics.avgPreparationTime <= 60 && metrics.conversionRate >= 80 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Performance excelente!</p>
                <p className="text-xs text-green-600">
                  Todas as métricas estão dentro dos parâmetros ideais
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;