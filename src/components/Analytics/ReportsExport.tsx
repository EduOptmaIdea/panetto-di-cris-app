import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportsExport: React.FC = () => {
  const { orders, customers, products } = useApp();
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [reportType, setReportType] = useState('sales');

  const generateCSV = <T extends Record<string, unknown>>(data: T[], filename: string) => {
    if (data.length === 0) {
      alert('Nenhum dado encontrado para o período selecionado');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(value =>
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateSalesReport = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    const filteredOrders = orders.filter(order => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const reportData = filteredOrders.map(order => ({
      'ID do Pedido': order.id,
      'Data': format(new Date(order.orderDate!), 'dd/MM/yyyy', { locale: ptBR }),
      'Cliente': order.customer.name,
      'WhatsApp': order.customer.whatsapp,
      'Status': order.currentStatus,
      'Status Pagamento': order.currentPaymentStatus,
      'Método Pagamento': order.paymentMethod,
      'Canal de Venda': order.salesChannel,
      'Subtotal': `R$ ${order.subtotal.toFixed(2)}`,
      'Taxa Entrega': `R$ ${order.deliveryFee.toFixed(2)}`,
      'Total': `R$ ${order.total.toFixed(2)}`,
      'Itens': order.items.map(item => `${item.quantity}x ${item.product.name}`).join('; ')
    }));

    generateCSV(reportData, 'relatorio_vendas');
  };

  const generateCustomersReport = () => {
    const reportData = customers.map(customer => ({
      'Nome': customer.name,
      'WhatsApp': customer.whatsapp,
      'Endereço': customer.address,
      'Total de Pedidos': customer.totalOrders,
      'Total Gasto': `R$ ${customer.totalSpent.toFixed(2)}`,
      'Data Cadastro': format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: ptBR }),
      'Observações': customer.observations || '',
      'Preferências Entrega': customer.deliveryPreferences || ''
    }));

    generateCSV(reportData, 'relatorio_clientes');
  };

  const generateProductsReport = () => {
    const productSales = products.map(product => {
      const totalSold = orders.reduce((sum, order) => {
        const productItems = order.items.filter(item => item.productId === product.id);
        return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);

      const totalRevenue = orders.reduce((sum, order) => {
        const productItems = order.items.filter(item => item.productId === product.id);
        return sum + productItems.reduce((itemSum, item) => itemSum + item.total, 0);
      }, 0);

      return {
        'Nome': product.name,
        'Descrição': product.description,
        'Preço': `R$ ${product.price.toFixed(2)}`,
        'Peso': product.weight ? `${product.weight}g` : '',
        'Ativo': product.isActive ? 'Sim' : 'Não',
        'Total Vendido': totalSold,
        'Receita Total': `R$ ${totalRevenue.toFixed(2)}`,
        'Data Cadastro': format(new Date(product.createdAt), 'dd/MM/yyyy', { locale: ptBR })
      };
    });

    generateCSV(productSales, 'relatorio_produtos');
  };

  const generateReport = () => {
    switch (reportType) {
      case 'sales':
        generateSalesReport();
        break;
      case 'customers':
        generateCustomersReport();
        break;
      case 'products':
        generateProductsReport();
        break;
      default:
        generateSalesReport();
    }
  };

  const setQuickDateRange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="w-6 h-6 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Exportar Relatórios</h3>
      </div>

      <div className="space-y-4">
        {/* Tipo de Relatório */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4" />
            <span>Tipo de Relatório</span>
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="sales">Relatório de Vendas</option>
            <option value="customers">Relatório de Clientes</option>
            <option value="products">Relatório de Produtos</option>
          </select>
        </div>

        {/* Período (apenas para vendas) */}
        {reportType === 'sales' && (
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Período</span>
            </label>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setQuickDateRange(7)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                Últimos 7 dias
              </button>
              <button
                onClick={() => setQuickDateRange(30)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                Últimos 30 dias
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setDateRange({
                    start: format(startOfMonth(now), 'yyyy-MM-dd'),
                    end: format(endOfMonth(now), 'yyyy-MM-dd')
                  });
                }}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                Este mês
              </button>
            </div>
          </div>
        )}

        {/* Botão de Exportar */}
        <button
          onClick={generateReport}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
        >
          <Download className="w-5 h-5" />
          <span>Exportar Relatório (CSV)</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Dica:</strong> Os relatórios são exportados em formato CSV e podem ser abertos no Excel, Google Sheets ou outros programas de planilha.
        </p>
      </div>
    </div>
  );
};

export default ReportsExport;