import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import type { Customer, Product, ProductCategory, Order, OrderItem, PriceHistory} from '../types';

type SupabaseProductRow = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  price_history: PriceHistory[] | null;
  image_url: string | null;
  weight: number | null;
  is_active: boolean;
  created_at: string;
  total_sold: number;
  custom_packaging: boolean;
};

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostSoldCategory, setMostSoldCategory] = useState<ProductCategory | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const [{ data: categoriesData, error: categoriesError },
        { data: productsData, error: productsError },
        { data: customersData, error: customersError }] = await Promise.all([
        supabase.from('product_categories').select('*').order('name', { ascending: true }),
        supabase.from('products').select('*').order('name', { ascending: true }),
        supabase.from('customers').select('*').order('name', { ascending: true }),
        supabase.from('orders').select('*, customer:customer_id(*), items:order_items(*)').order('created_at', { ascending: false })
      ]);

      if (categoriesError) throw categoriesError;
      if (productsError) throw productsError;
      if (customersError) throw customersError;
      
      const productCounts = new Map<string, number>();
      if (productsData) {
        productsData.forEach(p => {
          productCounts.set(p.category_id, (productCounts.get(p.category_id) || 0) + 1);
        });
      }

      const formattedCategories = categoriesData.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isActive: c.is_active,
        productCount: productCounts.get(c.id) || 0,
      }));

      const sortedProductsBySales = [...productsData].sort((a,b) => b.total_sold - a.total_sold);
      const mostSoldProduct = sortedProductsBySales.length > 0 ? sortedProductsBySales[0] : null;
      
      let mostSoldCat = null;
      if (mostSoldProduct) {
        mostSoldCat = formattedCategories.find(c => c.id === mostSoldProduct.category_id) || null;
      }
      setMostSoldCategory(mostSoldCat);

      const formattedProducts = productsData.map((p: SupabaseProductRow) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        weight: p.weight,
        customPackaging: p.custom_packaging,
        priceHistory: p.price_history || [],
        totalSold: p.total_sold,
        createdAt: new Date(p.created_at),
        image: p.image_url,
        category: p.category_id,
        isActive: p.is_active,
      }));

      const formattedCustomers = customersData.map(c => ({
        id: c.id,
        name: c.name,
        whatsapp: c.whatsapp,
        email: c.email,
        address: c.address,
        observations: c.observations,
        deliveryPreferences: c.delivery_preferences,
        createdAt: new Date(c.created_at),
        totalOrders: c.total_orders,
        totalSpent: c.total_spent,
        isGiftEligible: c.is_gift_eligible,
        completedOrders: c.completed_orders,
        cancelledOrders: c.cancelled_orders,
        pendingOrders: c.pending_orders,
        paidSpent: c.paid_spent,
        pendingSpent: c.pending_spent,
      }));

      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*, customer:customer_id(*), items:order_items(*)');
      if (ordersError) throw ordersError;
      
      const formattedOrders = ordersData.map(o => ({
        ...o,
        orderNumber: o.order_number,
        orderDate: new Date(o.order_date),
        customerId: o.customer_id,
        deliveryFee: o.delivery_fee,
        paymentStatus: o.payment_status,
        paymentMethod: o.payment_method,
        deliveryMethod: o.delivery_method,
        estimatedDelivery: o.estimated_delivery ? new Date(o.estimated_delivery) : null,
        completedAt: o.completed_at ? new Date(o.completed_at) : null,
      }));

      setProducts(formattedProducts);
      setCategories(formattedCategories);
      setCustomers(formattedCustomers);
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCustomerTotals = useCallback(async (customerId: string) => {
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

    const { error: updateError } = await supabase
      .from('customers')
      .update({
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        pending_orders: pendingOrders,
        paid_spent: paidSpent,
        pending_spent: pendingSpent,
      })
      .eq('id', customerId);

    if (updateError) {
      console.error('Error updating customer totals:', updateError);
    }
  }, [fetchData]);

  const addCategory = useCallback(async (category: Pick<ProductCategory, 'name' | 'description' | 'isActive'>) => {
    try {
      const { error } = await supabase.from('product_categories').insert({
        name: category.name,
        description: category.description,
        is_active: category.isActive,
      });
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  }, [fetchData]);

  const updateCategory = useCallback(async (id: string, updates: Partial<ProductCategory>) => {
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({
          name: updates.name,
          description: updates.description,
          is_active: updates.isActive,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  }, [fetchData]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countError) throw countError;

      if (count && count > 0) {
        addNotification({
  title: 'Erro ao excluir categoria',
  message: `Não é possível excluir a categoria com ${count} produto(s) vinculado(s).`,
  type: 'error',
});
return;
      }

      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      addNotification({
  title: 'Categoria excluída',
  message: 'Categoria excluída com sucesso!',
  type: 'success',
});
    } catch (err) {
      console.error('Error deleting category:', err);
      addNotification({
  title: 'Erro ao excluir categoria',
  message: 'Falha ao excluir categoria.',
  type: 'error',
});
    }
  }, [fetchData, addNotification]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'totalSold' | 'priceHistory' | 'customPackaging'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          weight: product.weight,
          image_url: product.image,
          is_active: product.isActive,
          category_id: product.category,
        });

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  }, [fetchData]);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          weight: product.weight,
          image_url: product.image,
          is_active: product.isActive,
          category_id: product.category,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  }, [fetchData]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  }, [fetchData]);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'isGiftEligible' | 'totalOrders' | 'totalSpent' | 'completedOrders' | 'cancelledOrders' | 'pendingOrders' | 'paidSpent' | 'pendingSpent'>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          whatsapp: customer.whatsapp,
          email: customer.email,
          address: customer.address,
          observations: customer.observations,
          delivery_preferences: customer.deliveryPreferences,
        });
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  }, [fetchData]);

  const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
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
      await fetchData();
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  }, [fetchData]);
  
  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'orderDate' | 'customer' | 'order_number'> & { items: OrderItem[]; order_number?: number }) => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          customer_id: order.customerId,
          status: order.status,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod,
          delivery_method: order.deliveryMethod,
          subtotal: order.subtotal,
          delivery_fee: order.deliveryFee,
          total: order.total,
          notes: order.notes,
          estimated_delivery: order.estimatedDelivery?.toISOString(),
          completed_at: order.completedAt?.toISOString(),
        });
      if (error) throw error;
      await fetchData();
      await updateCustomerTotals(order.customerId);
    } catch (err) {
      console.error('Error adding order:', err);
      throw err;
    }
  }, [fetchData, updateCustomerTotals]);

  const updateOrder = useCallback(async (id: string, orderData: Partial<Order>) => {
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
      await fetchData();
      
      const { data: updatedOrder, error: fetchError } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;
      if (updatedOrder.customer_id) {
          await updateCustomerTotals(updatedOrder.customer_id);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  }, [fetchData, updateCustomerTotals]);

  useEffect(() => {
    if (user) {
      fetchData();

      const productChannel = supabase
        .channel('products_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          fetchData();
        })
        .subscribe();
      
      const categoriesChannel = supabase
        .channel('categories_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, () => {
          fetchData();
        })
        .subscribe();

      const customersChannel = supabase
        .channel('customers_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(productChannel);
        supabase.removeChannel(categoriesChannel);
        supabase.removeChannel(customersChannel);
      };
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
    mostSoldCategory,
    addCustomer,
    updateCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addOrder,
    updateOrder,
    refetch: fetchData,
  };
};