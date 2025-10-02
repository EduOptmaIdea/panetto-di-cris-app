import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import type { Customer, Product, ProductCategory, Order, PriceHistory } from '../types';

type SupabaseProductRow = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  price_history: PriceHistory[] | null;
  image: string | null;
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
        { data: customersData, error: customersError },
        { data: productsData, error: productsError },] = await Promise.all([
        supabase.from('product_categories').select('*').order('name', { ascending: true }),
        supabase.from('customers').select('*').order('name', { ascending: true }),
        supabase.rpc('get_products_with_primary_image') // <-- MUDANÇA IMPORTANTE
      ]);

      if (categoriesError) throw categoriesError;
      if (productsError) throw productsError;
      if (customersError) throw customersError;

      const productCounts = new Map<string, number>();
      if (productsData) {
        productsData.forEach((p: SupabaseProductRow) => {
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

      const sortedProductsBySales = [...productsData].sort((a, b) => b.total_sold - a.total_sold);
      const mostSoldProduct = sortedProductsBySales.length > 0 ? sortedProductsBySales[0] : null;

      let mostSoldCat = null;
      if (mostSoldProduct) {
        mostSoldCat = formattedCategories.find(c => c.id === mostSoldProduct.category_id) || null;
      }

      setMostSoldCategory(mostSoldCat);

      const formattedProducts = productsData.map((p: SupabaseProductRow): Product => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        weight: p.weight,
        customPackaging: p.custom_packaging,
        priceHistory: p.price_history || [],
        totalSold: p.total_sold,
        createdAt: new Date(p.created_at),
        image: p.image,
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

      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*, customer:customer_id(*), items:order_items(*, product:product_id(*))').order('number', { ascending: false });
      if (ordersError) throw ordersError;

      const formattedOrders = ordersData.map((o): Order => ({
        id: o.id,
        number: o.number,
        orderDate: o.order_date ? new Date(o.order_date) : new Date(o.created_at),
        customerId: o.customer_id,
        customer: o.customer,
        items: o.items.map((item: any) => ({
          productId: item.product_id,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
          } as Product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          item_discount: item.item_discount,
          final_unit_price: item.final_unit_price,
        })),
        subtotal: o.subtotal,
        deliveryFee: o.delivery_fee,
        orderDiscount: o.order_discount,
        totalItemsDiscount: o.total_items_discount,
        total: o.total,
        currentStatus: o.current_status,
        currentPaymentStatus: o.current_payment_status,
        paymentMethod: o.payment_method,
        deliveryMethod: o.delivery_method,
        salesChannel: o.sales_channel,
        notes: o.notes,
        estimatedDelivery: o.estimated_delivery ? new Date(o.estimated_delivery) : null,
        completedAt: o.completed_at ? new Date(o.completed_at) : null,
        paymentDate: o.payment_date ? new Date(o.payment_date) : null,
        created_at: o.created_at,
      }));

      setProducts(formattedProducts);
      setCategories(formattedCategories);
      setCustomers(formattedCustomers);
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Error fetching data:', err);
      const error = err as { message: string };
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCustomerTotals = useCallback(async (customerId: string) => {
    const { data: customerOrders, error: ordersError } = await supabase
      .from('orders')
      .select('current_status, total, current_payment_status')
      .eq('customer_id', customerId);

    if (ordersError) {
      console.error('Error fetching customer orders for total calculation:', ordersError);
      return;
    }

    const totalOrders = customerOrders.length;
    const completedOrders = customerOrders.filter(order => order.current_status === 'delivered').length;
    const cancelledOrders = customerOrders.filter(order => order.current_status === 'cancelled').length;
    const pendingOrders = totalOrders - completedOrders - cancelledOrders;

    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
    const paidSpent = customerOrders.filter(order => order.current_payment_status === 'paid').reduce((sum, order) => sum + order.total, 0);
    const pendingSpent = totalSpent - paidSpent;


    const { error: updateError } = await supabase
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

    if (updateError) {
      console.error('Error updating customer totals:', updateError);
    }
  }, []);

  const addCategory = useCallback(async (category: Pick<ProductCategory, 'name' | 'description' | 'isActive'>) => {
    try {
      const { error } = await supabase.from('product_categories').insert({ name: category.name, description: category.description, is_active: category.isActive });
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  }, [fetchData]);

  const updateCategory = useCallback(async (id: string, updates: Partial<ProductCategory>) => {
    try {
      const { error } = await supabase.from('product_categories').update({ name: updates.name, description: updates.description, is_active: updates.isActive }).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  }, [fetchData]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { count, error: countError } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category_id', id);
      if (countError) throw countError;
      if (count && count > 0) {
        addNotification({ title: 'Erro ao excluir categoria', message: `Não é possível excluir a categoria com ${count} produto(s) vinculado(s).`, type: 'error' });
        return;
      }
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      addNotification({ title: 'Categoria excluída', message: 'Categoria excluída com sucesso!', type: 'success' });
    } catch (err) {
      console.error('Error deleting category:', err);
      addNotification({ title: 'Erro ao excluir categoria', message: 'Falha ao excluir categoria.', type: 'error' });
    }
  }, [fetchData, addNotification]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'totalSold' | 'priceHistory' | 'customPackaging'>): Promise<Product | null> => {
    try {
      const { data: newProductData, error } = await supabase
        .from('products')
        .insert({ 
          name: product.name, 
          description: product.description, 
          price: product.price, 
          weight: product.weight, 
          image_url: product.image, 
          is_active: product.isActive, 
          category_id: product.category 
        })
        .select() // Pede ao Supabase para retornar o registro inserido
        .single(); // Esperamos apenas um registro de retorno

      if (error) throw error;

      await fetchData(); // Recarrega todos os dados
      addNotification({ title: 'Produto Cadastrado', message: `O produto "${product.name}" foi criado com sucesso.`, type: 'success' });
      return newProductData as Product; // Retorna o produto recém-criado
    } catch (err) {
      console.error('Error adding product:', err);
      const error = err as { message: string };
      addNotification({ title: 'Erro ao Cadastrar', message: `Falha: ${error.message}`, type: 'error' });
      throw err;
    }
  }, [fetchData, addNotification]);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    try {
      const { error } = await supabase.from('products').update({ name: product.name, description: product.description, price: product.price, weight: product.weight, image_url: product.image, is_active: product.isActive, category_id: product.category }).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating product:', err);
      const error = err as { message: string };
      addNotification({ title: 'Erro ao atualizar produto', message: `Falha: ${error.message}`, type: 'error' });
      throw err;
    }
  }, [fetchData,addNotification]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const hasOrders = orders.some(order => order.items.some(item => item.productId === id));
      if (hasOrders) {
        addNotification({ title: 'Erro ao excluir produto', message: 'Não é possível excluir um produto que está em um ou mais pedidos.', type: 'error' });
        return;
      }
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      addNotification({ title: 'Produto excluído', message: 'Produto excluído com sucesso!', type: 'success' });
    } catch (err) {
      console.error('Error deleting product:', err);
      addNotification({ title: 'Erro ao excluir produto', message: 'Falha ao excluir produto.', type: 'error' });
    }
  }, [fetchData, orders, addNotification]);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'isGiftEligible' | 'totalOrders' | 'totalSpent' | 'completedOrders' | 'cancelledOrders' | 'pendingOrders' | 'paidSpent' | 'pendingSpent'>) => {
    try {
      const { error } = await supabase.from('customers').insert({ name: customer.name, whatsapp: customer.whatsapp, email: customer.email, address: customer.address, observations: customer.observations, delivery_preferences: customer.deliveryPreferences });
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  }, [fetchData]);

  const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
    try {
      const { error } = await supabase.from('customers').update({ name: customer.name, whatsapp: customer.whatsapp, email: customer.email, address: customer.address, observations: customer.observations, delivery_preferences: customer.deliveryPreferences }).eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  }, [fetchData]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      const hasOrders = orders.some(order => order.customerId === id);
      if (hasOrders) {
        addNotification({ title: 'Erro ao excluir cliente', message: 'Não é possível excluir um cliente com pedidos associados.', type: 'error' });
        return;
      }
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      addNotification({ title: 'Cliente excluído', message: 'Cliente excluído com sucesso!', type: 'success' });
    } catch (err) {
      console.error('Error deleting customer:', err);
      addNotification({ title: 'Erro ao excluir cliente', message: 'Falha ao excluir cliente.', type: 'error' });
    }
  }, [fetchData, orders, addNotification]);

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'customer' | 'number' | 'created_at'>) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const { data: counter } = await supabase.from('counters').select('last_number').eq('name', 'order_number').maybeSingle();
      let newOrderNumber = (counter?.last_number || 0) + 1;

      const { data: newOrderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: order.customerId,
          current_status: order.currentStatus,
          current_payment_status: order.currentPaymentStatus,
          payment_method: order.paymentMethod,
          delivery_method: order.deliveryMethod,
          subtotal: order.subtotal,
          delivery_fee: order.deliveryFee,
          total: order.total,
          notes: order.notes,
          number: newOrderNumber,
          order_discount: order.orderDiscount,
          total_items_discount: order.totalItemsDiscount,
          sales_channel: order.salesChannel,
          order_date: order.orderDate?.toISOString(),
          estimated_delivery: order.estimatedDelivery?.toISOString(),
          completed_at: order.completedAt?.toISOString(),
          payment_date: order.paymentDate?.toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      await supabase.from('counters').upsert({ name: 'order_number', last_number: newOrderNumber }, { onConflict: 'name' });

      const orderItemsToInsert = order.items.map(item => ({
        order_id: newOrderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        item_discount: item.item_discount,
        final_unit_price: item.final_unit_price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
      if (itemsError) throw itemsError;

      await updateCustomerTotals(order.customerId);
      await fetchData();
      addNotification({ title: 'Pedido Criado', message: `O pedido #${newOrderNumber} foi criado.`, type: 'success' });
    } catch (err) {
      const error = err as { message: string };
      console.error('Error adding order:', error.message);
      addNotification({ title: 'Erro ao criar pedido', message: `Falha: ${error.message}.`, type: 'error' });
      throw err;
    }
  }, [fetchData, updateCustomerTotals, addNotification, user]);

  const updateOrder = useCallback(async (id: string, orderData: Partial<Order>) => {
    try {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          customer_id: orderData.customerId,
          current_status: orderData.currentStatus,
          current_payment_status: orderData.currentPaymentStatus,
          payment_method: orderData.paymentMethod,
          delivery_method: orderData.deliveryMethod,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          total: orderData.total,
          notes: orderData.notes,
          order_discount: orderData.orderDiscount,
          total_items_discount: orderData.totalItemsDiscount,
          sales_channel: orderData.salesChannel,
          order_date: orderData.orderDate?.toISOString(),
          estimated_delivery: orderData.estimatedDelivery?.toISOString(),
          completed_at: orderData.completedAt?.toISOString(),
          payment_date: orderData.paymentDate?.toISOString(),
        })
        .eq('id', id);

      if (orderUpdateError) throw orderUpdateError;
      
      if (orderData.items) {
        await supabase.from('order_items').delete().eq('order_id', id);
        const orderItemsToInsert = orderData.items.map(item => ({
          order_id: id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          item_discount: item.item_discount,
          final_unit_price: item.final_unit_price,
        }));
        if (orderItemsToInsert.length > 0) {
            const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
            if (itemsError) throw itemsError;
        }
      }

      const customerId = orderData.customerId || orders.find(o => o.id === id)?.customerId;
      if (customerId) {
        await updateCustomerTotals(customerId);
      }
      
      await fetchData();
      addNotification({ title: 'Pedido Atualizado', message: 'O pedido foi atualizado com sucesso!', type: 'success' });
    } catch (err) {
      const error = err as { message: string };
      console.error('Error updating order:', error.message);
      addNotification({ title: 'Erro ao atualizar pedido', message: `Falha: ${error.message}.`, type: 'error' });
      throw err;
    }
  }, [fetchData, updateCustomerTotals, addNotification, orders]);

  const deleteOrder = useCallback(async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      await supabase.from('order_items').delete().eq('order_id', id);
      const { error: deleteError } = await supabase.from('orders').delete().eq('id', id);
      if (deleteError) throw deleteError;
      if (order?.customerId) {
        await updateCustomerTotals(order.customerId);
      }
      await fetchData();
      addNotification({ title: 'Pedido excluído', message: 'Pedido excluído com sucesso.', type: 'success' });
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
      addNotification({ title: 'Erro ao excluir pedido', message: 'Não foi possível excluir o pedido.', type: 'error' });
      throw err;
    }
  }, [fetchData, updateCustomerTotals, addNotification, orders]);

  useEffect(() => {
    if (user) {
      fetchData();
      const subscription = supabase.channel('public-changes').on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchData();
      }).subscribe();
      return () => { supabase.removeChannel(subscription); };
    } else {
      setCustomers([]);
      setProducts([]);
      setCategories([]);
      setOrders([]);
      setLoading(false);
    }
  }, [user, fetchData]);

  return {
    customers, products, categories, orders, loading, error, mostSoldCategory,
    addCustomer, updateCustomer, deleteCustomer,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
    addOrder, updateOrder, deleteOrder,
    refetch: fetchData,
  };
};