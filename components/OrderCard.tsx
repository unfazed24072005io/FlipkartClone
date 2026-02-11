import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Package, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Order, OrderStatus } from '@/types';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

const statusColors: Record<OrderStatus, string> = {
  pending: Colors.pending,
  processing: Colors.processing,
  shipped: Colors.shipped,
  delivered: Colors.delivered,
  cancelled: Colors.cancelled,
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderCard({ order, onPress, onCancel, showCancelButton = true }: OrderCardProps) {
  const firstItem = order.items[0];
  const remainingItems = order.items.length - 1;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{orderDate}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[order.status] }]}>
            {statusLabels[order.status]}
          </Text>
        </View>
      </View>

      <View style={styles.itemRow}>
        <Image
          source={{ uri: firstItem?.image || 'https://via.placeholder.com/60' }}
          style={styles.itemImage}
          contentFit="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{firstItem?.name}</Text>
          <Text style={styles.itemDetails}>
            Qty: {firstItem?.quantity} × ₹{firstItem?.price.toLocaleString()}
          </Text>
          {remainingItems > 0 && (
            <Text style={styles.moreItems}>+{remainingItems} more item(s)</Text>
          )}
        </View>
        <ChevronRight size={20} color={Colors.textMuted} />
      </View>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Package size={16} color={Colors.textSecondary} />
          <Text style={styles.deliveryText}>{order.location}</Text>
        </View>
        <Text style={styles.totalAmount}>₹{order.total.toLocaleString()}</Text>
      </View>

      {showCancelButton && order.status === 'pending' && onCancel && (
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemImage: {
    width: 60,
    height: 60,
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
  moreItems: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveryText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
});
