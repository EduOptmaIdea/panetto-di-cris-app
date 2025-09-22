import React, { useMemo } from 'react';
import { X, User, Mail, MapPin, FileText, ShoppingBag, DollarSign } from 'lucide-react';
import { Customer } from '../../types/index';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomerViewProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer;
}

const CustomerView: React.FC<CustomerViewProps> = ({ isOpen, onClose, customer }) => {
    const { orders } = useApp();

    // Filtra os pedidos do cliente selecionado
    const customerOrders = useMemo(() => {
        if (!customer) return [];
        return orders.filter(order => order.customerId === customer.id).sort((a, b) => {
            if (!a.orderDate || !b.orderDate) return 0;
            return b.orderDate.getTime() - a.orderDate.getTime();
        });
    }, [customer, orders]);

    if (!isOpen || !customer) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            preparing: 'bg-orange-100 text-orange-800 border-orange-200',
            ready: 'bg-green-100 text-green-800 border-green-200',
            delivered: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${badges[status as keyof typeof badges]}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Detalhes do Cliente</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Informações do Cliente */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <User className="w-10 h-10 p-2 bg-orange-100 text-orange-600 rounded-full flex-shrink-0" />
                            <div>
                                <p className="text-lg font-bold text-gray-900">{customer.name}</p>
                                <p className="text-sm text-gray-600">{customer.whatsapp}</p>
                            </div>
                        </div>

                        {customer.email && (
                            <div className="flex items-center space-x-2 text-gray-600">
                                <Mail className="w-5 h-5" />
                                <p>{customer.email}</p>
                            </div>
                        )}

                        {customer.address && (
                            <div className="flex items-start space-x-2 text-gray-600">
                                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                                <p>{customer.address}</p>
                            </div>
                        )}

                        {customer.deliveryPreferences && (
                            <div className="flex items-start space-x-2 text-gray-600">
                                <FileText className="w-5 h-5 flex-shrink-0 mt-1" />
                                <p>Preferências de Entrega: {customer.deliveryPreferences}</p>
                            </div>
                        )}

                        {customer.observations && (
                            <div className="flex items-start space-x-2 text-gray-600">
                                <FileText className="w-5 h-5 flex-shrink-0 mt-1" />
                                <p>Observações: {customer.observations}</p>
                            </div>
                        )}
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="grid grid-cols-2 gap-4 border-t pt-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
                            <p className="text-xl font-bold text-gray-900">{customer.totalOrders}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">Total Gasto</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                        </div>
                    </div>

                    {/* Histórico de Pedidos */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Pedidos Recentes ({customerOrders.length})</h3>
                        {customerOrders.length > 0 ? (
                            <ul className="space-y-4 max-h-60 overflow-y-auto">
                                {customerOrders.map(order => (
                                    <li key={order.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-900 mb-2">
                                            <span>Pedido #{order.order_number}</span>
                                            <span className="text-gray-500 text-xs">
                                                {order.orderDate ? format(order.orderDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data não disponível'}
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
                                                    <span>{formatCurrency(order.total)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={getStatusBadge(order.status)}>{order.status}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Este cliente não possui pedidos.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerView;