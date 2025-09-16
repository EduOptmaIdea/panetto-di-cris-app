import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, User, ShoppingCart, Plus, Minus, Truck, CreditCard } from 'lucide-react';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ isOpen, onClose }) => {
  const { addOrder, customers, products } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    paymentMethod: 'cash' as 'cash' | 'card' | 'pix' | 'transfer',
    salesChannel: 'direct' as 'direct' | 'whatsapp' | '99food' | 'ifood',
    deliveryFee: 0,
    notes: '',
    estimatedDelivery: '',
  });

  const [orderItems, setOrderItems] = useState<{ [key: string]: number }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(orderItems).length === 0) {
      alert('Adicione pelo menos um produto ao pedido');
      return;
    }

    setLoading(true);

    try {
      const items = Object.entries(orderItems).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        if (!product) throw new Error('Produto não encontrado');

        return {
          productId,
          product,
          quantity,
          unitPrice: product.price,
          total: product.price * quantity,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const total = subtotal + formData.deliveryFee;

      const orderData = {
        customerId: formData.customerId,
        items,
        subtotal,
        deliveryFee: formData.deliveryFee,
        total,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        paymentMethod: formData.paymentMethod,
        deliveryMethod: formData.deliveryMethod,
        salesChannel: formData.salesChannel,
        estimatedDelivery: formData.estimatedDelivery ? new Date(formData.estimatedDelivery) : undefined,
        notes: formData.notes,
      };

      await addOrder(orderData);
      onClose();

      // Reset form
      setFormData({
        customerId: '',
        deliveryMethod: 'pickup',
        paymentMethod: 'cash',
        salesChannel: 'direct',
        deliveryFee: 0,
        notes: '',
        estimatedDelivery: '',
      });
      setOrderItems({});
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao criar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'deliveryFee' ? parseFloat(value) || 0 : value,
    });
  };

  const addProduct = (productId: string) => {
    setOrderItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeProduct = (productId: string) => {
    setOrderItems(prev => {
      const newItems = { ...prev };
      if (newItems[productId] > 1) {
        newItems[productId]--;
      } else {
        delete newItems[productId];
      }
      return newItems;
    });
  };

  const getOrderTotal = () => {
    const subtotal = Object.entries(orderItems).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product?.price || 0) * quantity;
    }, 0);
    return subtotal + formData.deliveryFee;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Novo Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              <span>Cliente *</span>
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Selecione um cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.whatsapp}
                </option>
              ))}
            </select>
          </div>

          {/* Produtos */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
              <ShoppingCart className="w-4 h-4" />
              <span>Produtos *</span>
            </label>

            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
              {products.filter(p => p.isActive).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">R$ {product.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {orderItems[product.id] ? (
                      <>
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {orderItems[product.id]}
                        </span>
                        <button
                          type="button"
                          onClick={() => addProduct(product.id)}
                          className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addProduct(product.id)}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm"
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalhes do Pedido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Truck className="w-4 h-4" />
                <span>Entrega</span>
              </label>
              <select
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="pickup">Retirada</option>
                <option value="delivery">Entrega</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4" />
                <span>Pagamento</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="cash">Dinheiro</option>
                <option value="card">Cartão</option>
                <option value="pix">PIX</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Taxa de Entrega (R$)
              </label>
              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Previsão de Entrega
              </label>
              <input
                type="datetime-local"
                name="estimatedDelivery"
                value={formData.estimatedDelivery}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Observações sobre o pedido..."
            />
          </div>

          {/* Total */}
          {Object.keys(orderItems).length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total do Pedido:</span>
                <span>R$ {getOrderTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;