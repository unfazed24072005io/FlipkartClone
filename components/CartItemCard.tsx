import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Product } from '@/types';

interface CartItemCardProps {
  product: Product;
  quantity: number;
  price: number;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItemCard({
  product,
  quantity,
  price,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const itemTotal = price * quantity;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: product.images[0] }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price.toLocaleString()}</Text>
          {product.discountPercent > 0 && (
            <Text style={styles.originalPrice}>₹{product.basePrice.toLocaleString()}</Text>
          )}
          {product.discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discountPercent}% OFF</Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionsRow}>
          <View style={styles.quantityControl}>
            <Pressable
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => quantity > 1 && onUpdateQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus size={16} color={quantity <= 1 ? Colors.textMuted : Colors.primary} />
            </Pressable>
            
            <Text style={styles.quantity}>{quantity}</Text>
            
            <Pressable
              style={[styles.quantityButton, quantity >= product.inventory && styles.quantityButtonDisabled]}
              onPress={() => quantity < product.inventory && onUpdateQuantity(quantity + 1)}
              disabled={quantity >= product.inventory}
            >
              <Plus size={16} color={quantity >= product.inventory ? Colors.textMuted : Colors.primary} />
            </Pressable>
          </View>
          
          <Pressable style={styles.removeButton} onPress={onRemove}>
            <Trash2 size={18} color={Colors.error} />
          </Pressable>
        </View>
        
        <Text style={styles.itemTotal}>Total: ₹{itemTotal.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
});
