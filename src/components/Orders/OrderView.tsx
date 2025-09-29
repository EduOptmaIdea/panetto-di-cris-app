import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, User, Phone, MapPin } from 'lucide-react';
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
    const [paymentDate, setPaymentDate] = useState<string | null>(null);
    const [deliveryDate, setDeliveryDate] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !order) {
            return;
        }

        const fetchStatusDates = async () => {
            setPaymentDate(null);
            setDeliveryDate(null);

            const { data: paymentHistory, error: paymentError } = await supabase
                .from('order_status_history')
                .select('created_at')
                .eq('order_id', order.id)
                .eq('payment_status', 'paid')
                .order('created_at', { ascending: false })
                .limit(1);

            if (paymentError) console.error("Erro ao buscar data de pagamento:", paymentError);
            if (paymentHistory && paymentHistory.length > 0) {
                setPaymentDate(format(new Date(paymentHistory[0].created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
            }

            const { data: deliveryHistory, error: deliveryError } = await supabase
                .from('order_status_history')
                .select('created_at')
                .eq('order_id', order.id)
                .eq('status', 'delivered')
                .order('created_at', { ascending: false })
                .limit(1);

            if (deliveryError) console.error("Erro ao buscar data de entrega:", deliveryError);
            if (deliveryHistory && deliveryHistory.length > 0) {
                setDeliveryDate(format(new Date(deliveryHistory[0].created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
            }
        };

        fetchStatusDates();
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const getOrderDiscountTotal = () => {
        const itemsDiscount = order.items.reduce((sum, item) => sum + (item.item_discount || 0) * item.quantity, 0);
        const orderDiscount = order.orderDiscount || 0;
        return itemsDiscount + orderDiscount;
    };

    const getGrossSubtotal = () => {
        return order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    };

    const totalDiscounts = getOrderDiscountTotal();
    const grossSubtotal = getGrossSubtotal();

    // --- NOVA LÓGICA AQUI: Calcular o percentual de desconto total ---
    const discountPercentage = grossSubtotal > 0 ? (totalDiscounts / grossSubtotal) * 100 : 0;

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2 text-sm text-gray-600">
                            <div>
                                <p className="font-medium">Status:</p>
                                <span className={getStatusBadge(order.currentStatus)}>{getStatusLabel(order.currentStatus)}</span>
                                {deliveryDate && <p className="text-xs text-gray-500 mt-1">{deliveryDate}</p>}
                            </div>
                            <div>
                                <p className="font-medium">Pagamento:</p>
                                <span className={getPaymentBadge(order.currentPaymentStatus)}>{getPaymentLabel(order.currentPaymentStatus)}</span>
                                {paymentDate && <p className="text-xs text-gray-500 mt-1">{paymentDate}</p>}
                            </div>
                            <div>
                                <p className="font-medium">Método de Pagamento:</p>
                                <span className="text-gray-800 font-medium">{order.paymentMethod}</span>
                            </div>
                            <div>
                                <p className="font-medium">Canal de Venda:</p>
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
                                            {item.item_discount && item.item_discount > 0 ? (
                                                <span className="line-through text-red-500 mr-2">
                                                    {formatCurrency(item.unit_price)}
                                                </span>
                                            ) : null}
                                            {formatCurrency(item.final_unit_price)}
                                        </p>
                                        {item.item_discount && item.item_discount > 0 && (
                                            <p className="text-sm text-blue-400">
                                                Desconto por item: {formatCurrency(item.item_discount)}
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
                                <span>{formatCurrency(grossSubtotal)}</span>
                            </div>
                            {/* --- ALTERAÇÃO AQUI: Adicionado o percentual de desconto --- */}
                            <div className="flex justify-between text-red-600">
                                <span>Total de Descontos:</span>
                                <span>
                                    {totalDiscounts > 0 && `(-${discountPercentage.toFixed(1)}%) `}
                                    - {formatCurrency(totalDiscounts || 0)}
                                </span>
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