import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Customer, Product, ProductCategory, Order } from '../types';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = async () => {
    // Only fetch data if user is authenticated
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

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch products with categories
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name)
        `)
        .order('name');

      if (productsError) throw productsError;

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) throw customersError;

      // Fetch orders with related data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customers(*),
          order_items(
            *,
            products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Transform data to match frontend types
      const transformedCategories: ProductCategory[] = categoriesData?.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
      })) || [];

      const transformedProducts: Product[] = productsData?.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category_id,
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
        address: customer.address,
        observations: customer.observations || undefined,
        deliveryPreferences: customer.delivery_preferences || undefined,
        createdAt: new Date(customer.created_at),
        totalOrders: customer.total_orders,
        totalSpent: customer.total_spent,
      })) || [];

      const transformedOrders: Order[] = ordersData?.map(order => ({
        id: order.id,
        customerId: order.customer_id,
        customer: {
          id: order.customers.id,
          name: order.customers.name,
          whatsapp: order.customers.whatsapp,
          address: order.customers.address,
          observations: order.customers.observations,
          deliveryPreferences: order.customers.delivery_preferences,
          createdAt: new Date(order.customers.created_at),
          totalOrders: order.customers.total_orders,
          totalSpent: order.customers.total_spent,
        },
        items: order.order_items?.map(item => ({
          productId: item.product_id,
          product: {
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            category: item.products.category_id,
            price: item.products.price,
            priceHistory: [{ 
              date: new Date(item.products.created_at), 
              price: item.products.price, 
              channel: 'direct' as const 
            }],
            image: item.products.image_url || undefined,
            weight: item.products.weight || undefined,
            customPackaging: item.products.custom_packaging,
            isActive: item.products.is_active,
            createdAt: new Date(item.products.created_at),
            totalSold: item.products.total_sold,
          },
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total,
        })) || [],
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
        status: order.status as any,
        paymentStatus: order.payment_status as any,
        paymentMethod: order.payment_method as any,
        deliveryMethod: order.delivery_method as any,
        salesChannel: order.sales_channel as any,
        orderDate: new Date(order.created_at),
        estimatedDelivery: order.estimated_delivery ? new Date(order.estimated_delivery) : undefined,
        completedAt: order.completed_at ? new Date(order.completed_at) : undefined,
        notes: order.notes || undefined,
      })) || [];

      setCategories(transformedCategories);
      setProducts(transformedProducts);
      setCustomers(transformedCustomers);
      setOrders(transformedOrders);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for customers
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          whatsapp: customerData.whatsapp,
          address: customerData.address,
          observations: customerData.observations || '',
          delivery_preferences: customerData.deliveryPreferences || '',
        })
        .select()
        .single();

      if (error) throw error;
      await fetchData(); // Refresh data
      return data;
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          whatsapp: customerData.whatsapp,
          address: customerData.address,
          observations: customerData.observations,
          delivery_preferences: customerData.deliveryPreferences,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  // CRUD operations for products
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'totalSold' | 'priceHistory'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          category_id: productData.category,
          price: productData.price,
          image_url: productData.image || '',
          weight: productData.weight || 0,
          custom_packaging: productData.customPackaging,
          is_active: productData.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      // Add price history entry
      await supabase
        .from('price_history')
        .insert({
          product_id: data.id,
          price: productData.price,
          sales_channel: 'direct',
        });

      await fetchData(); // Refresh data
      return data;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          category_id: productData.category,
          price: productData.price,
          image_url: productData.image,
          weight: productData.weight,
          custom_packaging: productData.customPackaging,
          is_active: productData.isActive,
        })
        .eq('id', id);

      if (error) throw error;

      // Add price history if price changed
      if (productData.price !== undefined) {
        await supabase
          .from('price_history')
          .insert({
            product_id: id,
            price: productData.price,
            sales_channel: 'direct',
          });
      }

      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  // CRUD operations for orders
  const addOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>) => {
    try {
      // Insert order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: orderData.customerId,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          total: orderData.total,
          status: orderData.status,
          payment_status: orderData.paymentStatus,
          payment_method: orderData.paymentMethod,
          delivery_method: orderData.deliveryMethod,
          sales_channel: orderData.salesChannel,
          estimated_delivery: orderData.estimatedDelivery?.toISOString(),
          notes: orderData.notes || '',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
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

      await fetchData(); // Refresh data
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
      await fetchData(); // Refresh data
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
  }, [user]);

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