import React, { useMemo, useState } from 'react';
import { X, User, PackageCheck, Banknote, PackageX, AlertCircle, Filter, Clock, Check, Soup, Truck, FilterX, ShoppingBag } from 'lucide-react';
import { Customer, Order, OrderStatus, PaymentStatus } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrderView from '../Orders/OrderView';

interface CustomerViewProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer;
}

const CustomerView: React.FC<CustomerViewProps> = ({ isOpen, onClose, customer }) => {
    const { orders } = useApp();
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const isFilterActive = statusFilter !== 'all' || paymentFilter !== 'all';

    const handleClearFilters = () => {
        setStatusFilter('all');
        setPaymentFilter('all');
    };

    const customerOrders = useMemo(() => {
        if (!customer) return [];
        return orders
            .filter(order => order.customerId === customer.id)
            .sort((a, b) => {
                const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
                const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
                return dateB - dateA;
            });
    }, [customer, orders]);

    const financialSummary = useMemo(() => {
        const validOrders = customerOrders.filter(o => o.currentStatus !== 'cancelled');

        const paidSpent = validOrders
            .filter(o => o.currentPaymentStatus === 'paid')
            .reduce((sum, o) => sum + o.total, 0);

        const pendingSpent = validOrders
            .filter(o => o.currentPaymentStatus === 'pending')
            .reduce((sum, o) => sum + o.total, 0);

        return { paidSpent, pendingSpent };
    }, [customerOrders]);

    const filteredOrders = useMemo(() => {
        return customerOrders.filter(order => {
            const statusMatch = statusFilter === 'all' || order.currentStatus === statusFilter;
            const paymentMatch = paymentFilter === 'all' || order.currentPaymentStatus === paymentFilter;
            return statusMatch && paymentMatch;
        });
    }, [customerOrders, statusFilter, paymentFilter]);

    const statusCounts = useMemo(() => {
        return customerOrders.reduce((acc, order) => {
            acc[order.currentStatus] = (acc[order.currentStatus] || 0) + 1;
            return acc;
        }, {} as Record<OrderStatus, number>);
    }, [customerOrders]);


    if (!isOpen || !customer) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const getStatusLabel = (status: OrderStatus) => {
        const labels = { pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Preparando', ready: 'Pronto', delivered: 'Entregue', cancelled: 'Cancelado' };
        return labels[status] || status;
    };

    const getPaymentStatusLabel = (status: PaymentStatus) => {
        const labels = { pending: 'Pendente', paid: 'Pago', cancelled: 'Cancelado' };
        return labels[status] || status;
    };

    const getStatusBadge = (status: OrderStatus) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            preparing: 'bg-orange-100 text-orange-800 border-orange-200',
            ready: 'bg-teal-100 text-teal-800 border-teal-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${badges[status]}`;
    };

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${badges[status]}`;
    };

    const getCardClasses = (color: string, isActive: boolean) => {
        const base = 'p-3 rounded-lg flex items-center justify-between text-left transition-all duration-200';
        if (isActive) {
            if (color === 'yellow') return `${base} bg-yellow-500 text-white shadow-md`;
            if (color === 'blue') return `${base} bg-blue-500 text-white shadow-md`;
            if (color === 'orange') return `${base} bg-orange-500 text-white shadow-md`;
            if (color === 'green') return `${base} bg-green-500 text-white shadow-md`;
        }
        return `${base} bg-gray-100 hover:bg-gray-200 text-gray-700`;
    };

    const getCountClasses = (color: string, isActive: boolean) => {
        const base = 'text-lg font-bold';
        if (isActive) return `${base} text-white`;
        if (color === 'yellow') return `${base} text-yellow-500`;
        if (color === 'blue') return `${base} text-blue-500`;
        if (color === 'orange') return `${base} text-orange-500`;
        if (color === 'green') return `${base} text-green-500`;
        return `${base} text-gray-500`;
    };

    const statusCards: { status: OrderStatus, icon: React.ReactNode, color: string }[] = [
        { status: 'pending', icon: <Clock className="w-5 h-5" />, color: 'yellow' },
        { status: 'confirmed', icon: <Check className="w-5 h-5" />, color: 'blue' },
        { status: 'preparing', icon: <Soup className="w-5 h-5" />, color: 'orange' },
        { status: 'delivered', icon: <Truck className="w-5 h-5" />, color: 'green' },
    ];


    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-900">Raio-X do Cliente</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 flex-shrink-0">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">{customer.name}</p>
                                <p className="text-sm text-gray-600">{customer.whatsapp}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-6">
                            <div className="bg-green-50 p-4 rounded-lg flex items-start space-x-3"><div className="bg-green-100 p-2 rounded-full"><PackageCheck className="w-5 h-5 text-green-600" /></div><div><p className="text-sm font-medium text-gray-500">Concluídos</p><p className="text-xl font-bold text-gray-900">{statusCounts['delivered'] || 0}</p></div></div>
                            <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3"><div className="bg-blue-100 p-2 rounded-full"><Banknote className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm font-medium text-gray-500">Total Pago</p><p className="text-xl font-bold text-gray-900">{formatCurrency(financialSummary.paidSpent)}</p></div></div>
                            <div className="bg-yellow-50 p-4 rounded-lg flex items-start space-x-3"><div className="bg-yellow-100 p-2 rounded-full"><AlertCircle className="w-5 h-5 text-yellow-600" /></div><div><p className="text-sm font-medium text-gray-500">Valor Pendente</p><p className="text-xl font-bold text-gray-900">{formatCurrency(financialSummary.pendingSpent)}</p></div></div>
                            <div className="bg-red-50 p-4 rounded-lg flex items-start space-x-3"><div className="bg-red-100 p-2 rounded-full"><PackageX className="w-5 h-5 text-red-600" /></div><div><p className="text-sm font-medium text-gray-500">Cancelados</p><p className="text-xl font-bold text-gray-900">{statusCounts['cancelled'] || 0}</p></div></div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                            {statusCards.map(({ status, icon, color }) => {
                                const isActive = statusFilter === status;
                                return (
                                    <button key={status} onClick={() => setStatusFilter(isActive ? 'all' : status)} className={getCardClasses(color, isActive)}>
                                        <div className="flex items-center gap-2">{icon}<span className="font-semibold text-sm">{getStatusLabel(status)}</span></div>
                                        <span className={getCountClasses(color, isActive)}>{statusCounts[status] || 0}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="border-t pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                                <h3 className="text-lg font-bold text-gray-900">Histórico de Pedidos ({filteredOrders.length})</h3>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as any)} className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                                        <option value="all">Pagamentos</option>
                                        <option value="pending">Pendente</option>
                                        <option value="paid">Pago</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                    {isFilterActive && (
                                        <button onClick={handleClearFilters} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50">
                                            <FilterX className="w-4 h-4" />
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {filteredOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                                                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredOrders.map(order => {
                                                const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                                                return (
                                                    <tr key={order.id} onClick={() => setViewingOrder(order)} className={`cursor-pointer hover:bg-gray-50 ${order.currentStatus === 'delivered' ? 'opacity-80 hover:opacity-100' : ''}`}>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-800">#{order.number}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{order.orderDate ? format(new Date(order.orderDate), 'dd/MM/yy HH:mm', { locale: ptBR }) : ''}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                                            <div className="flex items-center justify-center" title={`Total de ${totalQuantity} unidades`}>
                                                                <span>{order.items.length}</span>
                                                                <ShoppingBag className="w-4 h-4 text-gray-400 ml-1" />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-right">{formatCurrency(order.total)}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-center"><span className={getPaymentStatusBadge(order.currentPaymentStatus)}>{getPaymentStatusLabel(order.currentPaymentStatus)}</span></td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-center"><span className={getStatusBadge(order.currentStatus)}>{getStatusLabel(order.currentStatus)}</span></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center text-sm italic py-8">Nenhum pedido encontrado para os filtros selecionados.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {viewingOrder && (
                <OrderView isOpen={!!viewingOrder} onClose={() => setViewingOrder(null)} order={viewingOrder} />
            )}
        </>
    );
};

export default CustomerView;