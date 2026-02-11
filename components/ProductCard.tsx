import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Star, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  price: number;
  onPress: () => void;
}

export default function ProductCard({ product, price, onPress }: ProductCardProps) {
  const hasDiscount = product.discountPercent > 0;
  const savings = product.basePrice - price;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discountPercent}% OFF</Text>
          </View>
        )}
        <Pressable style={styles.heartButton}>
          <Heart size={18} color={Colors.textMuted} />
        </Pressable>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.ratingRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{product.rating || 4.0}</Text>
            <Star size={10} color="#fff" fill="#fff" />
          </View>
          <Text style={styles.reviewCount}>({product.reviewCount || 0})</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price.toLocaleString()}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>₹{product.basePrice.toLocaleString()}</Text>
          )}
        </View>
        
        {hasDiscount && (
          <Text style={styles.savings}>Save ₹{savings.toLocaleString()}</Text>
        )}
        
        {product.inventory <= 5 && product.inventory > 0 && (
          <Text style={styles.lowStock}>Only {product.inventory} left!</Text>
        )}
        
        {product.inventory === 0 && (
          <Text style={styles.outOfStock}>Out of Stock</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  savings: {
    fontSize: 11,
    color: Colors.success,
    marginTop: 4,
    fontWeight: '500',
  },
  lowStock: {
    fontSize: 11,
    color: Colors.warning,
    marginTop: 4,
    fontWeight: '500',
  },
  outOfStock: {
    fontSize: 11,
    color: Colors.error,
    marginTop: 4,
    fontWeight: '600',
  },
});
