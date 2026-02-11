import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart, MapPin, ChevronDown, Truck, CreditCard, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import CartItemCard from '@/components/CartItemCard';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { 
    cart, 
    products, 
    deliveryCharges, 
    getProductPrice, 
    updateCartQuantity, 
    removeFromCart,
    placeOrder,
    clearCart,
  } = useData();

  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedLocation, setSelectedLocation] = useState(deliveryCharges[0]?.id || '');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const cartDetails = useMemo(() => {
    let subtotal = 0;
    let totalWeight = 0;
    const items: { productId: string; quantity: number; product: typeof products[0]; price: number }[] = [];

    cart.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      if (product) {
        const price = getProductPrice(product);
        subtotal += price * cartItem.quantity;
        totalWeight += product.weightKg * cartItem.quantity;
        items.push({ ...cartItem, product, price });
      }
    });

    const location = deliveryCharges.find(d => d.id === selectedLocation);
    const deliveryCharge = location ? Math.round(totalWeight * location.pricePerKg) : 0;
    const total = subtotal + deliveryCharge;

    return { items, subtotal, totalWeight, deliveryCharge, total };
  }, [cart, products, getProductPrice, deliveryCharges, selectedLocation]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to checkout', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select delivery location');
      return;
    }

    setIsPlacingOrder(true);
    const result = await placeOrder(address.trim(), phone.trim(), selectedLocation);
    setIsPlacingOrder(false);

    if (result.success) {
      setShowCheckout(false);
      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${result.orderId?.slice(-8).toUpperCase()} has been placed.`,
        [{ text: 'View Orders', onPress: () => router.push('/(tabs)/orders') }]
      );
    } else {
      Alert.alert('Order Failed', result.error || 'Failed to place order');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ShoppingCart size={80} color={Colors.border} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Sign in to add items to your cart</Text>
        <Pressable style={styles.signInButton} onPress={() => router.push('/login')}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ShoppingCart size={80} color={Colors.border} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items to start shopping</Text>
        <Pressable style={styles.shopButton} onPress={() => router.push('/(tabs)/(home)')}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{cart.length} items</Text>
      </View>

      <FlatList
        data={cartDetails.items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CartItemCard
            product={item.product}
            quantity={item.quantity}
            price={item.price}
            onUpdateQuantity={(qty) => updateCartQuantity(item.productId, qty)}
            onRemove={() => removeFromCart(item.productId)}
          />
        )}
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{cartDetails.subtotal.toLocaleString()}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery ({cartDetails.totalWeight.toFixed(2)} kg)</Text>
              <Text style={styles.summaryValue}>₹{cartDetails.deliveryCharge.toLocaleString()}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{cartDetails.total.toLocaleString()}</Text>
            </View>
          </View>
        }
      />

      <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.checkoutTotal}>₹{cartDetails.total.toLocaleString()}</Text>
          <Text style={styles.checkoutItems}>{cart.length} items</Text>
        </View>
        <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </Pressable>
      </View>

      <Modal
        visible={showCheckout}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCheckout(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout</Text>
              <Pressable onPress={() => setShowCheckout(false)}>
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.checkoutSection}>
                <View style={styles.sectionHeader}>
                  <MapPin size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your full address"
                  placeholderTextColor={Colors.textMuted}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.checkoutSection}>
                <View style={styles.sectionHeader}>
                  <CreditCard size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Phone Number</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.checkoutSection}>
                <View style={styles.sectionHeader}>
                  <Truck size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Delivery Location</Text>
                </View>
                <View style={styles.locationOptions}>
                  {deliveryCharges.map((loc) => (
                    <Pressable
                      key={loc.id}
                      style={[
                        styles.locationOption,
                        selectedLocation === loc.id && styles.locationOptionSelected,
                      ]}
                      onPress={() => setSelectedLocation(loc.id)}
                    >
                      <Text style={[
                        styles.locationName,
                        selectedLocation === loc.id && styles.locationNameSelected,
                      ]}>
                        {loc.name}
                      </Text>
                      <Text style={[
                        styles.locationPrice,
                        selectedLocation === loc.id && styles.locationPriceSelected,
                      ]}>
                        ₹{loc.pricePerKg}/kg
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.orderSummary}>
                <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{cartDetails.subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  <Text style={styles.summaryValue}>₹{cartDetails.deliveryCharge.toLocaleString()}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{cartDetails.total.toLocaleString()}</Text>
                </View>
              </View>
            </ScrollView>

            <Pressable 
              style={[styles.placeOrderButton, isPlacingOrder && styles.placeOrderButtonDisabled]}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              <Text style={styles.placeOrderButtonText}>
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  itemCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  checkoutItems: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  checkoutSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationOptions: {
    gap: 10,
  },
  locationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  locationNameSelected: {
    color: Colors.primary,
  },
  locationPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  locationPriceSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  orderSummary: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  placeOrderButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
