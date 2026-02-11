import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Package, X, ChevronDown, Filter } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Order, OrderStatus } from '@/types';
import OrderCard from '@/components/OrderCard';

const statusFilters: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { orders, allOrders, cancelOrder, updateOrderStatus } = useData();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const isAdmin = user?.role === 'admin';
  const displayOrders = isAdmin ? allOrders : orders;

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return displayOrders;
    return displayOrders.filter(o => o.status === statusFilter);
  }, [displayOrders, statusFilter]);

  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelOrder(order.id),
        },
      ]
    );
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    setSelectedOrder(null);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Package size={80} color={Colors.border} />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Sign in to view your orders</Text>
        <Pressable style={styles.signInButton} onPress={() => router.push('/login')}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isAdmin ? 'All Orders' : 'My Orders'}
        </Text>
        <Text style={styles.subtitle}>
          {filteredOrders.length} orders
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {statusFilters.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.filterChip,
                statusFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(filter.id)}
            >
              <Text style={[
                styles.filterChipText,
                statusFilter === filter.id && styles.filterChipTextActive,
              ]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => setSelectedOrder(item)}
            onCancel={() => handleCancelOrder(item)}
            showCancelButton={!isAdmin}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={60} color={Colors.border} />
            <Text style={styles.emptyStateText}>No orders found</Text>
          </View>
        }
      />

      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <Pressable onPress={() => setSelectedOrder(null)}>
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>
                    Order #{selectedOrder.id.slice(-8).toUpperCase()}
                  </Text>
                  <Text style={styles.orderDate}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.statusSection}>
                  <Text style={styles.sectionTitle}>Status</Text>
                  {isAdmin ? (
                    <View style={styles.statusOptions}>
                      {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                        <Pressable
                          key={status}
                          style={[
                            styles.statusOption,
                            selectedOrder.status === status && styles.statusOptionActive,
                          ]}
                          onPress={() => handleUpdateStatus(selectedOrder.id, status)}
                        >
                          <Text style={[
                            styles.statusOptionText,
                            selectedOrder.status === status && styles.statusOptionTextActive,
                          ]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(selectedOrder.status) + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(selectedOrder.status) }]}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.itemsSection}>
                  <Text style={styles.sectionTitle}>Items ({selectedOrder.items.length})</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        contentFit="cover"
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.itemDetails}>
                          ₹{item.price.toLocaleString()} × {item.quantity}
                        </Text>
                      </View>
                      <Text style={styles.itemTotal}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.deliverySection}>
                  <Text style={styles.sectionTitle}>Delivery Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{selectedOrder.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedOrder.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedOrder.phone}</Text>
                  </View>
                </View>

                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>Payment Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>₹{selectedOrder.subtotal.toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Charge</Text>
                    <Text style={styles.summaryValue}>₹{selectedOrder.deliveryCharge.toLocaleString()}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{selectedOrder.total.toLocaleString()}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending: Colors.pending,
    processing: Colors.processing,
    shipped: Colors.shipped,
    delivered: Colors.delivered,
    cancelled: Colors.cancelled,
  };
  return colors[status];
};

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
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  orderHeader: {
    marginBottom: 20,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  orderDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusOptionActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  statusOptionText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  statusOptionTextActive: {
    color: Colors.primary,
  },
  statusBadgeLarge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: 24,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  itemDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  deliverySection: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  summarySection: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
});
