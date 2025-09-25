import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, User, ShoppingCart, Plus, Minus, Truck, CreditCard, Calendar, Clock, CheckCircle, Package } from 'lucide-react';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { format, parseISO } from 'date-fns';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  isEditing?: boolean;
}

const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

const formatDateForInput = (date: Date | string | null | undefined, includeTime = false): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (includeTime) {
      return format(dateObj, "yyyy-MM-dd'T'HH:mm");
    }
    return format(dateObj, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose, order, isEditing }) => {
  const { addOrder, updateOrder, customers, products } = useApp();
  const [loading, setLoading] = useState(false);

  const getInitialFormData = (order?: Order) => ({
    customerId: order?.customerId || '',
    status: order?.currentStatus || 'pending',
    paymentStatus: order?.currentPaymentStatus || 'pending',
    salesChannel: order?.salesChannel || 'direct',
    deliveryMethod: order?.deliveryMethod || 'pickup',
    paymentMethod: order?.paymentMethod || 'cash',
    deliveryFee: order?.deliveryFee || 0,
    orderDiscount: order?.orderDiscount || 0,
    notes: order?.notes || '',
    orderDate: formatDateForInput(order?.orderDate, true) || formatDateForInput(new Date(), true),
    estimatedDelivery: formatDateForInput(order?.estimatedDelivery, true),
    completedAt: formatDateForInput(order?.completedAt, true),
    paymentDate: formatDateForInput(order?.paymentDate, true),
  });

  const [formData, setFormData] = useState(getInitialFormData(order));

  const getProductId = (item: any): string => item.productId || item.product?.id;

  const [orderItems, setOrderItems] = useState<{ [key: string]: number }>({});
  const [itemDiscounts, setItemDiscounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(order));
      const initialItems = order?.items.reduce((acc, item) => {
        acc[getProductId(item)] = item.quantity;
        return acc;
      }, {} as { [key: string]: number }) || {};
      setOrderItems(initialItems);

      const initialDiscounts = order?.items.reduce((acc, item) => {
        acc[getProductId(item)] = item.item_discount || 0;
        return acc;
      }, {} as { [key: string]: number }) || {};
      setItemDiscounts(initialDiscounts);
    }
  }, [order, isOpen]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(orderItems).length === 0) {
      alert('Adicione pelo menos um produto ao pedido.');
      return;
    }
    setLoading(true);
    try {
      const items = Object.entries(orderItems).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        if (!product) throw new Error(`Produto com ID ${productId} não encontrado.`);

        const discount = itemDiscounts[productId] || 0;
        const finalUnitPrice = product.price - discount;
        const total = finalUnitPrice * quantity;

        return { productId, product, quantity, unit_price: product.price, total, item_discount: discount, final_unit_price: finalUnitPrice };
      });

      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const totalItemsDiscount = items.reduce((sum, item) => sum + (item.item_discount! * item.quantity), 0);
      const total = subtotal - totalItemsDiscount + Number(formData.deliveryFee) - Number(formData.orderDiscount);

      const orderData = {
        customerId: formData.customerId,
        items,
        subtotal,
        deliveryFee: Number(formData.deliveryFee),
        total,
        orderDiscount: Number(formData.orderDiscount),
        totalItemsDiscount,
        currentStatus: formData.status as OrderStatus,
        currentPaymentStatus: formData.paymentStatus as PaymentStatus,
        paymentMethod: formData.paymentMethod as any,
        deliveryMethod: formData.deliveryMethod as any,
        salesChannel: formData.salesChannel as any,
        notes: formData.notes,
        orderDate: formData.orderDate ? new Date(formData.orderDate) : new Date(),
        estimatedDelivery: formData.estimatedDelivery ? new Date(formData.estimatedDelivery) : null,
        completedAt: formData.completedAt ? new Date(formData.completedAt) : null,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate) : null,
      };

      if (isEditing && order) {
        await updateOrder(order.id, orderData);
      } else {
        await addOrder(orderData as any);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      alert(`Erro ao salvar pedido: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'status' && value === 'delivered' && !newState.completedAt) {
        newState.completedAt = formatDateForInput(new Date(), true);
      }
      if (name === 'paymentStatus' && value === 'paid' && !newState.paymentDate) {
        newState.paymentDate = formatDateForInput(new Date(), true);
      }
      if (name === 'status' && value === 'cancelled') {
        newState.paymentStatus = 'cancelled';
      }
      return newState;
    });
  };

  const handleItemDiscountChange = (productId: string, value: string) => {
    setItemDiscounts(prev => ({ ...prev, [productId]: parseFloat(value) || 0 }));
  };

  const handleAddProduct = (productId: string) => {
    setOrderItems(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const handleRemoveProduct = (productId: string) => {
    setOrderItems(prev => {
      const newItems = { ...prev };
      if (newItems[productId] > 1) newItems[productId]--;
      else {
        delete newItems[productId];
        const newDiscounts = { ...itemDiscounts };
        delete newDiscounts[productId];
        setItemDiscounts(newDiscounts);
      }
      return newItems;
    });
  };

  const getSubtotal = () => Object.entries(orderItems).reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product?.price || 0) * quantity;
  }, 0);
  const getTotalItemsDiscount = () => Object.entries(itemDiscounts).reduce((sum, [productId, discount]) => sum + discount * (orderItems[productId] || 0), 0);
  const getTotalOrderDiscount = () => getTotalItemsDiscount() + Number(formData.orderDiscount);
  const getOrderTotal = () => getSubtotal() - getTotalItemsDiscount() + Number(formData.deliveryFee) - Number(formData.orderDiscount);

  if (!isOpen) return null;

  const productsToShow = products.filter(p => p.isActive || Object.keys(orderItems).includes(p.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? `Editar Pedido #${order?.number}` : 'Novo Pedido'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form id="order-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"><User className="w-4 h-4" /><span>Cliente *</span></label>
                <select name="customerId" value={formData.customerId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="">Selecione um cliente</option>
                  {customers.map((c) => (<option key={c.id} value={c.id}>{c.name} - {c.whatsapp}</option>))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3"><ShoppingCart className="w-4 h-4" /><span>Produtos *</span></label>
                <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {productsToShow.map((product) => (
                    <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg shadow-sm gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          {itemDiscounts[product.id] > 0 && (<span className="text-red-500 line-through mr-2">{formatCurrency(product.price)}</span>)}
                          {formatCurrency(product.price - (itemDiscounts[product.id] || 0))}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {orderItems[product.id] > 0 && (
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Desc(R$):</label>
                            <input type="number" value={itemDiscounts[product.id] || ''} onChange={(e) => handleItemDiscountChange(product.id, e.target.value)} className="w-20 px-2 py-1 text-sm text-center border rounded-lg" step="0.50" min="0" placeholder="0,00" />
                          </div>
                        )}
                        {orderItems[product.id] ? (
                          <>
                            <button type="button" onClick={() => handleRemoveProduct(product.id)} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-semibold">{orderItems[product.id]}</span>
                            <button type="button" onClick={() => handleAddProduct(product.id)} className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <button type="button" onClick={() => handleAddProduct(product.id)} className="px-3 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-sm font-semibold">Adicionar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"><Package className="w-4 h-4" /><span>Status do Pedido</span></label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="pending">Pendente</option><option value="confirmed">Confirmado</option><option value="preparing">Preparando</option><option value="ready">Pronto</option><option value="delivered">Entregue</option><option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"><CheckCircle className="w-4 h-4" /><span>Status do Pagamento</span></label>
                  <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="pending">Pendente</option><option value="paid">Pago</option><option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-3">Datas e Prazos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"><Calendar className="w-4 h-4" /><span>Data do Pedido</span></label>
                    <input type="datetime-local" name="orderDate" value={formData.orderDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"><Clock className="w-4 h-4" /><span>Previsão de Entrega</span></label>
                    <input type="datetime-local" name="estimatedDelivery" value={formData.estimatedDelivery} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  {isEditing && <>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"><Truck className="w-4 h-4" /><span>Data da Entrega</span></label>
                      <input type="datetime-local" name="completedAt" value={formData.completedAt} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2"><CreditCard className="w-4 h-4" /><span>Data do Pagamento</span></label>
                      <input type="datetime-local" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Taxa de Entrega (R$)</label>
                  <input type="number" name="deliveryFee" value={formData.deliveryFee} onChange={handleChange} min="0" step="0.05" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0,00" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Desconto Geral (R$)</label>
                  <input type="number" name="orderDiscount" value={formData.orderDiscount} onChange={handleChange} min="0" step="0.05" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0,00" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Observações</label>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Observações sobre o pedido..." />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Entrega</label>
              <select name="deliveryMethod" value={formData.deliveryMethod} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="pickup">Retirada</option><option value="delivery">Entrega</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Pagamento</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="cash">Dinheiro</option><option value="card">Cartão</option><option value="pix">PIX</option><option value="transfer">Transferência</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Canal de Venda</label>
              <select name="salesChannel" value={formData.salesChannel} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="direct">Direto</option><option value="whatsapp">WhatsApp</option><option value="99food">99Food</option><option value="ifood">iFood</option>
              </select>
            </div>
          </div>
        </form>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-6 border-t sticky bottom-0 bg-white z-10">
          {Object.keys(orderItems).length > 0 && (
            <div className="flex-grow bg-gray-100 p-4 rounded-lg flex items-center justify-around text-center">
              <div>
                <span className="text-sm text-gray-600 block">Subtotal</span>
                <span className="font-semibold text-lg">{formatCurrency(getSubtotal())}</span>
              </div>
              <div className="text-red-500">
                <span className="text-sm block">Descontos</span>
                <span className="font-semibold text-lg">- {formatCurrency(getTotalOrderDiscount())}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Entrega</span>
                <span className="font-semibold text-lg">{formatCurrency(formData.deliveryFee)}</span>
              </div>
              <div className="text-blue-600">
                <span className="text-sm block">Total</span>
                <span className="font-bold text-xl">{formatCurrency(getOrderTotal())}</span>
              </div>
            </div>
          )}
          <div className="flex space-x-3 w-full md:w-auto">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-semibold">Cancelar</button>
            <button type="submit" form="order-form" disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 font-semibold">
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Pedido')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;