import React, { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { database } from '@/config/firebase';
import { useAuth } from './AuthContext';
import {
  Category,
  Product,
  Banner,
  DeliveryCharge,
  CartItem,
  Order,
  OrderItem,
  User,
  OrderStatus,
  PriceOverride,
} from '@/types';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialDeliveryCharges,
} from '@/mocks/initialData';

const CATEGORIES_PREFIX = 'categories';
const PRODUCTS_PREFIX = 'products';
const BANNERS_PREFIX = 'banners';
const DELIVERY_PREFIX = 'deliveryCharges';
const CARTS_PREFIX = 'carts';
const ORDERS_PREFIX = 'orders';
const OVERRIDES_PREFIX = 'priceOverrides';
const USERS_PREFIX = 'users';

export const [DataProvider, useData] = createContextHook(() => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const initializeData = useCallback(async () => {
    try {
      const existingCategories = await database.getAll<Category>(CATEGORIES_PREFIX);
      if (Object.keys(existingCategories).length === 0) {
        for (const cat of initialCategories) {
          await database.set(`${CATEGORIES_PREFIX}/${cat.id}`, cat);
        }
      }

      const existingProducts = await database.getAll<Product>(PRODUCTS_PREFIX);
      if (Object.keys(existingProducts).length === 0) {
        for (const prod of initialProducts) {
          await database.set(`${PRODUCTS_PREFIX}/${prod.id}`, prod);
        }
      }

      const existingBanners = await database.getAll<Banner>(BANNERS_PREFIX);
      if (Object.keys(existingBanners).length === 0) {
        for (const banner of initialBanners) {
          await database.set(`${BANNERS_PREFIX}/${banner.id}`, banner);
        }
      }

      const existingDelivery = await database.getAll<DeliveryCharge>(DELIVERY_PREFIX);
      if (Object.keys(existingDelivery).length === 0) {
        for (const charge of initialDeliveryCharges) {
          await database.set(`${DELIVERY_PREFIX}/${charge.id}`, charge);
        }
      }
    } catch (error) {
      console.log('Initialize data error:', error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await initializeData();

      const cats = await database.getAll<Category>(CATEGORIES_PREFIX);
      setCategories(Object.values(cats));

      const prods = await database.getAll<Product>(PRODUCTS_PREFIX);
      setProducts(Object.values(prods));

      const bans = await database.getAll<Banner>(BANNERS_PREFIX);
      setBanners(Object.values(bans));

      const dels = await database.getAll<DeliveryCharge>(DELIVERY_PREFIX);
      setDeliveryCharges(Object.values(dels));

      if (user) {
        const userCart = await database.getAll<CartItem>(`${CARTS_PREFIX}/${user.uid}`);
        setCart(Object.values(userCart));

        const userOrders = await database.getAll<Order>(ORDERS_PREFIX);
        const filtered = Object.values(userOrders).filter(o => o.uid === user.uid);
        setOrders(filtered.sort((a, b) => b.createdAt - a.createdAt));

        if (user.role === 'seller' || user.role === 'distributor') {
          const overrides = await database.getAll<PriceOverride>(`${OVERRIDES_PREFIX}/${user.uid}`);
          const overrideMap: Record<string, number> = {};
          Object.values(overrides).forEach(o => {
            overrideMap[o.productId] = o.overridePrice;
          });
          setPriceOverrides(overrideMap);
        }

        if (user.role === 'admin') {
          const allOrd = await database.getAll<Order>(ORDERS_PREFIX);
          setAllOrders(Object.values(allOrd).sort((a, b) => b.createdAt - a.createdAt));

          const users = await database.getAll<User>(USERS_PREFIX);
          setAllUsers(Object.values(users));
        }
      }
    } catch (error) {
      console.log('Load all data error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, initializeData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const getProductPrice = useCallback((product: Product): number => {
    if (priceOverrides[product.id]) {
      return priceOverrides[product.id];
    }
    const discount = product.basePrice * (product.discountPercent / 100);
    return Math.round(product.basePrice - discount);
  }, [priceOverrides]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!user) return;
    try {
      const existing = cart.find(item => item.productId === productId);
      const product = products.find(p => p.id === productId);
      
      if (!product || product.inventory < quantity) return;

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.inventory);
        const updated: CartItem = { productId, quantity: newQty };
        await database.set(`${CARTS_PREFIX}/${user.uid}/${productId}`, updated);
        setCart(prev => prev.map(item => 
          item.productId === productId ? updated : item
        ));
      } else {
        const newItem: CartItem = { productId, quantity };
        await database.set(`${CARTS_PREFIX}/${user.uid}/${productId}`, newItem);
        setCart(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.log('Add to cart error:', error);
    }
  }, [user, cart, products]);

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!user) return;
    try {
      if (quantity <= 0) {
        await database.remove(`${CARTS_PREFIX}/${user.uid}/${productId}`);
        setCart(prev => prev.filter(item => item.productId !== productId));
      } else {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const newQty = Math.min(quantity, product.inventory);
        const updated: CartItem = { productId, quantity: newQty };
        await database.set(`${CARTS_PREFIX}/${user.uid}/${productId}`, updated);
        setCart(prev => prev.map(item =>
          item.productId === productId ? updated : item
        ));
      }
    } catch (error) {
      console.log('Update cart error:', error);
    }
  }, [user, products]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) return;
    try {
      await database.remove(`${CARTS_PREFIX}/${user.uid}/${productId}`);
      setCart(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.log('Remove from cart error:', error);
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    try {
      for (const item of cart) {
        await database.remove(`${CARTS_PREFIX}/${user.uid}/${item.productId}`);
      }
      setCart([]);
    } catch (error) {
      console.log('Clear cart error:', error);
    }
  }, [user, cart]);

  const placeOrder = useCallback(async (
    address: string,
    phone: string,
    locationId: string
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    if (!user || cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    try {
      const location = deliveryCharges.find(d => d.id === locationId);
      if (!location) {
        return { success: false, error: 'Invalid delivery location' };
      }

      const orderItems: OrderItem[] = [];
      let subtotal = 0;
      let totalWeight = 0;

      for (const cartItem of cart) {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product || product.inventory < cartItem.quantity) {
          return { success: false, error: `${product?.name || 'Product'} is out of stock` };
        }

        const price = getProductPrice(product);
        const itemTotal = price * cartItem.quantity;
        subtotal += itemTotal;
        totalWeight += product.weightKg * cartItem.quantity;

        orderItems.push({
          productId: product.id,
          name: product.name,
          price,
          quantity: cartItem.quantity,
          image: product.images[0] || '',
          weightKg: product.weightKg,
        });
      }

      const deliveryCharge = Math.round(totalWeight * location.pricePerKg);
      const total = subtotal + deliveryCharge;

      const orderId = database.generateId();
      const order: Order = {
        id: orderId,
        uid: user.uid,
        role: user.role,
        items: orderItems,
        subtotal,
        deliveryCharge,
        total,
        location: location.name,
        address,
        phone,
        status: 'pending',
        createdAt: Date.now(),
      };

      await database.set(`${ORDERS_PREFIX}/${orderId}`, order);

      for (const cartItem of cart) {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
          const updatedProduct = {
            ...product,
            inventory: product.inventory - cartItem.quantity,
          };
          await database.set(`${PRODUCTS_PREFIX}/${product.id}`, updatedProduct);
        }
      }

      await clearCart();
      setOrders(prev => [order, ...prev]);
      await loadAllData();

      return { success: true, orderId };
    } catch (error) {
      console.log('Place order error:', error);
      return { success: false, error: 'Failed to place order' };
    }
  }, [user, cart, products, deliveryCharges, getProductPrice, clearCart, loadAllData]);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || order.status !== 'pending') return false;

      const updated: Order = { ...order, status: 'cancelled', updatedAt: Date.now() };
      await database.set(`${ORDERS_PREFIX}/${orderId}`, updated);

      for (const item of order.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const updatedProduct = {
            ...product,
            inventory: product.inventory + item.quantity,
          };
          await database.set(`${PRODUCTS_PREFIX}/${product.id}`, updatedProduct);
        }
      }

      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      await loadAllData();
      return true;
    } catch (error) {
      console.log('Cancel order error:', error);
      return false;
    }
  }, [orders, products, loadAllData]);

  const addCategory = useCallback(async (name: string, image: string): Promise<boolean> => {
    try {
      const id = database.generateId();
      const category: Category = { id, name, image, createdAt: Date.now() };
      await database.set(`${CATEGORIES_PREFIX}/${id}`, category);
      setCategories(prev => [...prev, category]);
      return true;
    } catch (error) {
      console.log('Add category error:', error);
      return false;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>): Promise<boolean> => {
    try {
      const category = categories.find(c => c.id === id);
      if (!category) return false;
      const updated = { ...category, ...updates };
      await database.set(`${CATEGORIES_PREFIX}/${id}`, updated);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      return true;
    } catch (error) {
      console.log('Update category error:', error);
      return false;
    }
  }, [categories]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      await database.remove(`${CATEGORIES_PREFIX}/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.log('Delete category error:', error);
      return false;
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const id = database.generateId();
      const newProduct: Product = { ...product, id, createdAt: Date.now() };
      await database.set(`${PRODUCTS_PREFIX}/${id}`, newProduct);
      setProducts(prev => [...prev, newProduct]);
      return true;
    } catch (error) {
      console.log('Add product error:', error);
      return false;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return false;
      const updated = { ...product, ...updates };
      await database.set(`${PRODUCTS_PREFIX}/${id}`, updated);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return true;
    } catch (error) {
      console.log('Update product error:', error);
      return false;
    }
  }, [products]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      await database.remove(`${PRODUCTS_PREFIX}/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.log('Delete product error:', error);
      return false;
    }
  }, []);

  const addBanner = useCallback(async (title: string, subtitle: string, image: string): Promise<boolean> => {
    try {
      const id = database.generateId();
      const banner: Banner = { id, title, subtitle, image, active: true, createdAt: Date.now() };
      await database.set(`${BANNERS_PREFIX}/${id}`, banner);
      setBanners(prev => [...prev, banner]);
      return true;
    } catch (error) {
      console.log('Add banner error:', error);
      return false;
    }
  }, []);

  const updateBanner = useCallback(async (id: string, updates: Partial<Banner>): Promise<boolean> => {
    try {
      const banner = banners.find(b => b.id === id);
      if (!banner) return false;
      const updated = { ...banner, ...updates };
      await database.set(`${BANNERS_PREFIX}/${id}`, updated);
      setBanners(prev => prev.map(b => b.id === id ? updated : b));
      return true;
    } catch (error) {
      console.log('Update banner error:', error);
      return false;
    }
  }, [banners]);

  const deleteBanner = useCallback(async (id: string): Promise<boolean> => {
    try {
      await database.remove(`${BANNERS_PREFIX}/${id}`);
      setBanners(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (error) {
      console.log('Delete banner error:', error);
      return false;
    }
  }, []);

  const addDeliveryCharge = useCallback(async (name: string, pricePerKg: number): Promise<boolean> => {
    try {
      const id = database.generateId();
      const charge: DeliveryCharge = { id, name, pricePerKg };
      await database.set(`${DELIVERY_PREFIX}/${id}`, charge);
      setDeliveryCharges(prev => [...prev, charge]);
      return true;
    } catch (error) {
      console.log('Add delivery charge error:', error);
      return false;
    }
  }, []);

  const updateDeliveryCharge = useCallback(async (id: string, updates: Partial<DeliveryCharge>): Promise<boolean> => {
    try {
      const charge = deliveryCharges.find(d => d.id === id);
      if (!charge) return false;
      const updated = { ...charge, ...updates };
      await database.set(`${DELIVERY_PREFIX}/${id}`, updated);
      setDeliveryCharges(prev => prev.map(d => d.id === id ? updated : d));
      return true;
    } catch (error) {
      console.log('Update delivery charge error:', error);
      return false;
    }
  }, [deliveryCharges]);

  const deleteDeliveryCharge = useCallback(async (id: string): Promise<boolean> => {
    try {
      await database.remove(`${DELIVERY_PREFIX}/${id}`);
      setDeliveryCharges(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (error) {
      console.log('Delete delivery charge error:', error);
      return false;
    }
  }, []);

  const updateUserStatus = useCallback(async (uid: string, status: 'active' | 'blocked'): Promise<boolean> => {
    try {
      const targetUser = allUsers.find(u => u.uid === uid);
      if (!targetUser) return false;
      const updated = { ...targetUser, status };
      await database.set(`${USERS_PREFIX}/${uid}`, updated);
      setAllUsers(prev => prev.map(u => u.uid === uid ? updated : u));
      return true;
    } catch (error) {
      console.log('Update user status error:', error);
      return false;
    }
  }, [allUsers]);

  const updateUserRole = useCallback(async (uid: string, role: User['role']): Promise<boolean> => {
    try {
      const targetUser = allUsers.find(u => u.uid === uid);
      if (!targetUser) return false;
      const updated = { ...targetUser, role };
      await database.set(`${USERS_PREFIX}/${uid}`, updated);
      setAllUsers(prev => prev.map(u => u.uid === uid ? updated : u));
      return true;
    } catch (error) {
      console.log('Update user role error:', error);
      return false;
    }
  }, [allUsers]);

  const deleteUser = useCallback(async (uid: string): Promise<boolean> => {
    try {
      await database.remove(`${USERS_PREFIX}/${uid}`);
      setAllUsers(prev => prev.filter(u => u.uid !== uid));
      return true;
    } catch (error) {
      console.log('Delete user error:', error);
      return false;
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const order = allOrders.find(o => o.id === orderId);
      if (!order) return false;
      const updated: Order = { ...order, status, updatedAt: Date.now() };
      await database.set(`${ORDERS_PREFIX}/${orderId}`, updated);
      setAllOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return true;
    } catch (error) {
      console.log('Update order status error:', error);
      return false;
    }
  }, [allOrders]);

  const setPriceOverride = useCallback(async (productId: string, price: number): Promise<boolean> => {
    if (!user) return false;
    try {
      const override: PriceOverride = { productId, overridePrice: price };
      await database.set(`${OVERRIDES_PREFIX}/${user.uid}/${productId}`, override);
      setPriceOverrides(prev => ({ ...prev, [productId]: price }));
      return true;
    } catch (error) {
      console.log('Set price override error:', error);
      return false;
    }
  }, [user]);

  const removePriceOverride = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      await database.remove(`${OVERRIDES_PREFIX}/${user.uid}/${productId}`);
      setPriceOverrides(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      return true;
    } catch (error) {
      console.log('Remove price override error:', error);
      return false;
    }
  }, [user]);

  const getCartTotal = useCallback(() => {
    let subtotal = 0;
    let totalWeight = 0;
    const items: (CartItem & { product: Product })[] = [];

    for (const cartItem of cart) {
      const product = products.find(p => p.id === cartItem.productId);
      if (product) {
        const price = getProductPrice(product);
        subtotal += price * cartItem.quantity;
        totalWeight += product.weightKg * cartItem.quantity;
        items.push({ ...cartItem, product });
      }
    }

    return { subtotal, totalWeight, items, itemCount: cart.length };
  }, [cart, products, getProductPrice]);

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  return {
    categories,
    products,
    banners,
    deliveryCharges,
    cart,
    orders,
    allOrders,
    allUsers,
    priceOverrides,
    isLoading,
    getProductPrice,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    cancelOrder,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    addBanner,
    updateBanner,
    deleteBanner,
    addDeliveryCharge,
    updateDeliveryCharge,
    deleteDeliveryCharge,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    updateOrderStatus,
    setPriceOverride,
    removePriceOverride,
    getCartTotal,
    refreshData,
  };
});
