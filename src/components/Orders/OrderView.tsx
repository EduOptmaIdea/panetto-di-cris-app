import React from 'react';
import { X, User, Phone, MapPin } from 'lucide-react'; // ✅ Importações corrigidas
import type { Order, OrderStatus, PaymentStatus } from '../../types';

interface OrderViewProps {
    isOpen: boolean;
    onClose: () => void;
    order?: Order;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const getStatusBadge = (status: OrderStatus) => {
    const badges = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
        preparing: 'bg-orange-100 text-orange-800 border-orange-200',
        ready: 'bg-green-100 text-green-800 border-green-200',
        delivered: 'bg-gray-100 text-gray-800 border-gray-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${badges[status]}`;
};

const getPaymentBadge = (status: PaymentStatus) => {
    const badges = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${badges[status]}`;
};

const getStatusLabel = (status: OrderStatus) => {
    const labels = {
        pending: 'Pendente',
        confirmed: 'Confirmado',
        preparing: 'Preparando',
        ready: 'Pronto',
        delivered: 'Entregue',
        cancelled: 'Cancelado',
    };
    return labels[status] || status;
};

const getPaymentLabel = (status: PaymentStatus) => {
    const labels = {
        pending: 'Pendente',
        paid: 'Pago',
        cancelled: 'Cancelado',
    };
    return labels[status] || status;
};

const OrderView: React.FC<OrderViewProps> = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const getOrderDiscountTotal = () => {
        const itemsDiscount = order.items.reduce((sum, item) => sum + (item.itemDiscount || 0) * item.quantity, 0);
        const orderDiscount = order.orderDiscount || 0;
        return itemsDiscount + orderDiscount;
    };

    const totalDiscounts = getOrderDiscountTotal();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Detalhes do Pedido #{order.number}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Informações do Cliente */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>{order.customer.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>{order.customer.whatsapp}</span>
                            </div>
                            <div className="md:col-span-2 flex items-start space-x-2">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
                                <p>{order.customer.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status do Pedido */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Status do Pedido</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                                <p>Status:</p>
                                <span className={getStatusBadge(order.status)}>{getStatusLabel(order.status)}</span>
                            </div>
                            <div>
                                <p>Pagamento:</p>
                                <span className={getPaymentBadge(order.paymentStatus)}>{getPaymentLabel(order.paymentStatus)}</span>
                            </div>
                            <div>
                                <p>Método de Pagamento:</p>
                                <span className="text-gray-800 font-medium">{order.paymentMethod}</span>
                            </div>
                            <div>
                                <p>Canal de Venda:</p>
                                <span className="text-gray-800 font-medium">{order.salesChannel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Itens do Pedido */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido ({order.items.length})</h3>
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{item.product.name}</p>
                                        <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {item.itemDiscount && item.itemDiscount > 0 ? (
                                                <span className="line-through text-gray-500 mr-2">
                                                    {formatCurrency(item.unitPrice)}
                                                </span>
                                            ) : null}
                                            {formatCurrency(item.finalUnitPrice || item.unitPrice)}
                                        </p>
                                        {item.itemDiscount && item.itemDiscount > 0 && (
                                            <p className="text-sm text-red-600">
                                                Desconto por item: {formatCurrency(item.itemDiscount)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumo Financeiro</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal Bruto:</span>
                                <span>{formatCurrency(order.subtotal + (totalDiscounts || 0))}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Total de Descontos:</span>
                                <span>- {formatCurrency(totalDiscounts || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Taxa de Entrega:</span>
                                <span>{formatCurrency(order.deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Observações */}
                    {order.notes && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                            <p className="text-sm text-gray-600 italic">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderView;