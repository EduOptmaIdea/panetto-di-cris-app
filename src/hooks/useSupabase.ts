import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
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
    const pendingSpent = customerOrders.filter(order => order.payment_status === 'pending').reduce((sum, order) => sum + order.total, 0);
    const totalSpent = paidSpent + pendingSpent;
    const totalOrders = customerOrders.length;
    const isGiftEligible = totalSpent >= 150 && totalOrders >= 3;

    await supabase
      .from('customers')
      .update({
        total_orders: totalOrders,
        total_spent: totalSpent,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        pending_orders: pendingOrders,
        paid_spent: paidSpent,
        pending_spent: pendingSpent,
        is_gift_eligible: isGiftEligible,
      })
      .eq('id', customerId);
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'totalSold' | 'priceHistory'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          weight: product.weight,
          image_url: product.image,
          is_active: product.isActive,
          category_id: product.category,
        })
        .select();

      if (error) throw error;

      if (data) {
        const newProduct = { ...product, id: data[0].id, createdAt: new Date(), totalSold: 0, priceHistory: [] };
        setProducts(prevProducts => [...prevProducts, newProduct]);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      // throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          weight: updates.weight,
          image_url: updates.image,
          is_active: updates.isActive,
          category_id: updates.category,
        })
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === id ? { ...p, ...updates } : p
        )
      );
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteProduct = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'isGiftEligible' | 'totalOrders' | 'totalSpent' | 'completedOrders' | 'cancelledOrders' | 'pendingOrders' | 'paidSpent' | 'pendingSpent'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          whatsapp: customer.whatsapp,
          email: customer.email,
          address: customer.address,
          observations: customer.observations,
          delivery_preferences: customer.deliveryPreferences,
        })
        .select();

      if (error) throw error;

      if (data) {
        const newCustomer = {
          ...customer,
          id: data[0].id,
          createdAt: new Date(),
          isGiftEligible: false,
          totalOrders: 0,
          totalSpent: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          pendingOrders: 0,
          paidSpent: 0,
          pendingSpent: 0,
        };
        setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          whatsapp: customer.whatsapp,
          email: customer.email,
          address: customer.address,
          observations: customer.observations,
          delivery_preferences: customer.deliveryPreferences,
        })
        .eq('id', id);

      if (error) throw error;

      setCustomers(prevCustomers => prevCustomers.map(c => c.id === id ? { ...c, ...customer } : c));
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'orderDate' | 'customer' | 'order_number'> & {
    items: OrderItem[];
    order_number?: number;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: order.customerId,
          items: order.items,
          subtotal: order.subtotal,
          delivery_fee: order.deliveryFee,
          total: order.total,
          status: order.status,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod,
          delivery_method: order.deliveryMethod,
          notes: order.notes,
          estimated_delivery: order.estimatedDelivery?.toISOString(),
          order_number: order.order_number,
        })
        .select();

      if (error) throw error;
      
      if (data) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', order.customerId)
          .single();

        if (customerError) throw customerError;

        const newOrder = {
          ...order,
          id: data[0].id,
          orderDate: new Date(data[0].order_date),
          customer: customerData,
        };
        setOrders(prevOrders => [...prevOrders, newOrder]);
        await updateCustomerTotals(order.customerId);
      }
    } catch (err) {
      console.error('Error adding order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

// ... (código anterior)

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      const [
        { data: customersData, error: customersError },
        { data: productsData, error: productsError },
        { data: categoriesData, error: categoriesError },
        { data: ordersData, error: ordersError },
      ] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('product_categories').select('*').order('name'),
        supabase.from('orders').select('*, customer:customers(*)').order('created_at', { ascending: false }), // ✅ Corrigido para 'created_at'
      ]);

      if (customersError) throw customersError;
      if (productsError) throw productsError;
      if (categoriesError) throw categoriesError;
      if (ordersError) throw ordersError;
      
      const formattedCustomers = customersData.map(c => ({
        ...c,
        isGiftEligible: c.is_gift_eligible,
        totalOrders: c.total_orders,
        totalSpent: c.total_spent,
        completedOrders: c.completed_orders,
        cancelledOrders: c.cancelled_orders,
        pendingOrders: c.pending_orders,
        paidSpent: c.paid_spent,
        pendingSpent: c.pending_spent,
        deliveryPreferences: c.delivery_preferences,
      }));
      
      const formattedProducts = productsData.map(p => ({
        ...p,
        isActive: p.is_active,
        priceHistory: p.price_history || [],
        totalSold: p.total_sold,
        createdAt: new Date(p.created_at),
        image: p.image_url,
        category: p.category_id,
      }));

      const formattedOrders = ordersData.map(o => ({
        ...o,
        orderNumber: o.order_number ?? 0,
        orderDate: new Date(o.created_at), // ✅ Usando created_at para a data do pedido
        customerId: o.customer_id,
        deliveryFee: o.delivery_fee,
        paymentStatus: o.payment_status,
        paymentMethod: o.payment_method,
        deliveryMethod: o.delivery_method,
        estimatedDelivery: o.estimated_delivery ? new Date(o.estimated_delivery) : null,
        completedAt: o.completed_at ? new Date(o.completed_at) : null,
      }));

      setCustomers(formattedCustomers);
      setProducts(formattedProducts);
      setCategories(categoriesData);
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user]);

// ... (resto do código)

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
    deleteProduct, // ✅ Retorne a nova função de exclusão
    addOrder,
    updateOrder,
    refetch: fetchData,
  };
};