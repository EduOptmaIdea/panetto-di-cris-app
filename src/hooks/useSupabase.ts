import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Customer, Product, ProductCategory, Order, OrderItem} from '../types';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateCustomerTotals = async (customerId: string) => {
    const { data: customerOrders, error: ordersError } = await supabase
      .from('orders')
      .select('status, total, payment_status')
      .eq('customer_id', customerId);

    if (ordersError) {
      console.error('Error fetching customer orders for total calculation:', ordersError);
      return;
    }

    const completedOrders = customerOrders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = customerOrders.filter(order => order.status === 'cancelled').length;
    const pendingOrders = customerOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length;

    const paidSpent = customerOrders.filter(order => order.payment_status === 'paid').reduce((sum, order) => sum + order.total, 0);
    const pendingSpent = customerOrders.filter(order => order.payment_status !== 'paid').reduce((sum, order) => sum + order.total, 0);

    const totalOrders = completedOrders + pendingOrders;
    const totalSpent = paidSpent;

    const { data: customerData, error: customerFetchError } = await supabase
      .from('customers')
      .select('is_gift_eligible')
      .eq('id', customerId)
      .single();
    if (customerFetchError) console.error('Error fetching customer:', customerFetchError);

    const isGiftEligible = paidSpent >= 300 && (!customerData || !customerData.is_gift_eligible);
    if (isGiftEligible) {
      await supabase.from('customers').update({ is_gift_eligible: true }).eq('id', customerId);
      console.log(`Cliente ${customerId} agora é elegível para brinde!`);
    }

    const { error: customerError } = await supabase
      .from('customers')
      .update({
        total_orders: totalOrders,
        total_spent: totalSpent,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        pending_orders: pendingOrders,
        paid_spent: paidSpent,
        pending_spent: pendingSpent,
      })
      .eq('id', customerId);

    if (customerError) {
      console.error('Error updating customer totals:', customerError);
    }
  };

  const fetchData = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      setProducts([]);
      setCategories([]);
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      if (categoriesError) throw categoriesError;

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name)
        `)
        .order('name');
      if (productsError) throw productsError;

      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (customersError) throw customersError;

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(id, name, whatsapp, address, observations, delivery_preferences, created_at, total_orders, total_spent),
          items:order_items(
            quantity,
            unit_price,
            total,
            product:products(id, name, description, category_id, price, image_url, weight, custom_packaging, is_active, created_at, total_sold)
          )
        `)
        .order('created_at', { ascending: false });
      if (ordersError) throw ordersError;

      const transformedCategories: ProductCategory[] = categoriesData?.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
      })) || [];

      const transformedProducts: Product[] = productsData?.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category as string,
        price: product.price,
        priceHistory: [{
          date: new Date(product.created_at),
          price: product.price,
          channel: 'direct' as const
        }],
        image: product.image_url || undefined,
        weight: product.weight || undefined,
        customPackaging: product.custom_packaging,
        isActive: product.is_active,
        createdAt: new Date(product.created_at),
        totalSold: product.total_sold,
      })) || [];

      const transformedCustomers: Customer[] = customersData?.map(customer => ({
        id: customer.id,
        name: customer.name,
        whatsapp: customer.whatsapp,
        email: customer.email ?? null,
        address: customer.address,
        observations: customer.observations ?? null,
        deliveryPreferences: customer.delivery_preferences ?? null,
        createdAt: new Date(customer.created_at),
        totalOrders: customer.total_orders,
        totalSpent: customer.total_spent,
        completedOrders: customer.completed_orders,
        cancelledOrders: customer.cancelled_orders,
        pendingOrders: customer.pending_orders,
        paidSpent: customer.paid_spent,
        pendingSpent: customer.pending_spent,
        isGiftEligible: customer.is_gift_eligible,
      })) || [];
      
      type ProductRaw = {
        id: string;
        name: string;
        description: string;
        category_id: string;
        price: number;
        image_url: string | null;
        weight: number | null;
        custom_packaging: boolean;
        is_active: boolean;
        created_at: string;
        total_sold: number;
      };
      
      type OrderItemRaw = {
        product: ProductRaw;
        quantity: number;
        unit_price: number;
        total: number;
      };

      const transformedOrders: Order[] = ordersData?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        customerId: order.customer_id,
        customer: {
          id: order.customer.id,
          name: order.customer.name,
          whatsapp: order.customer.whatsapp,
          email: order.customer.email ?? null,
          address: order.customer.address,
          observations: order.customer.observations ?? null,
          deliveryPreferences: order.customer.delivery_preferences ?? null,
          createdAt: new Date(order.customer.created_at),
          totalOrders: order.customer.total_orders,
          totalSpent: order.customer.total_spent,
          completedOrders: order.customer.completed_orders,
          cancelledOrders: order.customer.cancelled_orders,
          pendingOrders: order.customer.pending_orders,
          paidSpent: order.customer.paid_spent,
          pendingSpent: order.customer.pending_spent,
          isGiftEligible: order.customer.is_gift_eligible,
        },
        items: order.items?.map((item: OrderItemRaw) => ({
          productId: item.product.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            category: item.product.category_id,
            price: item.product.price,
            priceHistory: [],
            image: item.product.image_url || undefined,
            weight: item.product.weight || undefined,
            customPackaging: item.product.custom_packaging,
            isActive: item.product.is_active,
            createdAt: new Date(item.product.created_at),
            totalSold: item.product.total_sold,
          },
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total,
        })) || [],
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
        status: order.status as Order['status'],
        paymentStatus: order.payment_status as Order['paymentStatus'],
        paymentMethod: order.payment_method as Order['paymentMethod'],
        deliveryMethod: order.delivery_method as Order['deliveryMethod'],
        salesChannel: order.sales_channel as Order['salesChannel'],
        orderDate: new Date(order.created_at),
        estimatedDelivery: new Date(order.estimated_delivery),
        completedAt: new Date(order.completed_at),
        notes: order.notes ?? null,
      })) || [];


      setCategories(transformedCategories);
      setProducts(transformedProducts);
      setCustomers(transformedCustomers);
      setOrders(transformedOrders);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
      console.error('Error in fetchData:', err);
    } finally {
      setLoading(false);
    }
  }, [user]); // Adicionando useCallback e a dependência `user`

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'isGiftEligible' | 'completedOrders' | 'cancelledOrders' | 'pendingOrders' | 'paidSpent' | 'pendingSpent'>) => {
    try {
      const newCustomer = {
        ...customerData,
        delivery_preferences: customerData.deliveryPreferences,
      };

      const { data, error } = await supabase.from('customers').insert(newCustomer).select().single();
      if (error) throw error;
      await fetchData();
      return data;
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const { error } = await supabase.from('customers').update(customerData).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'totalSold' | 'category'> & { categoryId: string }) => {
    try {
      const newProduct = {
        ...productData,
        total_sold: 0,
        price_history: productData.priceHistory,
        category_id: productData.categoryId
      };
      const { error } = await supabase.from('products').insert(newProduct);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const { error } = await supabase.from('products').update(productData).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const addOrder = async (
  orderData: Omit<Order, 'id' | 'orderDate' | 'customer' | 'order_number'> & {
    items: OrderItem[];
    order_number?: number;
  }
) => {
    try {
      // 1. Obter e atualizar o próximo número do contador
      const { data: counter, error: counterError } = await supabase
        .from('counters')
        .select('last_number')
        .eq('name', 'order')
        .single();
      if (counterError) {
        throw new Error('Erro ao buscar o contador de pedidos.');
      }
      
      const nextOrderNumber = (counter.last_number || 0) + 1;
      
      const { error: updateCounterError } = await supabase
        .from('counters')
        .update({ last_number: nextOrderNumber })
        .eq('name', 'order');
      if (updateCounterError) {
        throw new Error('Erro ao atualizar o contador de pedidos.');
      }
      
      // 2. Preparar os dados para a inserção do pedido
      const orderToInsert = {
        ...orderData,
        order_number: nextOrderNumber,
        estimated_delivery: orderData.estimatedDelivery?.toISOString(),
      };
      
      // 3. Inserir o novo pedido
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderToInsert)
        .select()
        .single();
      if (orderError) throw orderError;
      
      // 4. Inserir os itens do pedido
      const orderItems = orderData.items.map(item => ({
        order_id: orderResult.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 5. Atualizar totais do cliente
      await updateCustomerTotals(orderData.customerId);
      
      // 6. Atualizar os dados locais
      await fetchData();
      
      return orderResult;
    } catch (err) {
      console.error('Error adding order:', err);
      throw err;
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: orderData.status,
          payment_status: orderData.paymentStatus,
          payment_method: orderData.paymentMethod,
          delivery_method: orderData.deliveryMethod,
          estimated_delivery: orderData.estimatedDelivery?.toISOString(),
          completed_at: orderData.completedAt?.toISOString(),
          notes: orderData.notes,
        })
        .eq('id', id);

      if (error) throw error;

      // Refetch customer totals after order update
      const { data: updatedOrder, error: fetchError } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (updatedOrder.customer_id) {
        await updateCustomerTotals(updatedOrder.customer_id);
      }

      await fetchData();
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setCustomers([]);
      setProducts([]);
      setCategories([]);
      setOrders([]);
      setLoading(false);
    }
  }, [user, fetchData]);

  return {
    customers,
    products,
    categories,
    orders,
    loading,
    error,
    addCustomer,
    updateCustomer,
    addProduct,
    updateProduct,
    addOrder,
    updateOrder,
    refetch: fetchData,
  };
};