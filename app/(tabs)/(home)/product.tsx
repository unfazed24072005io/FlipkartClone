import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Minus, Plus, ShoppingCart, Zap, Package, Shield, Truck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const { width } = Dimensions.get('window');

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { products, categories, getProductPrice, addToCart, cart } = useData();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  const category = useMemo(() => categories.find(c => c.id === product?.categoryId), [categories, product]);
  const price = product ? getProductPrice(product) : 0;
  const savings = product ? product.basePrice - price : 0;
  const inCart = cart.find(item => item.productId === id);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found</Text>
      </View>
    );
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
      return;
    }
    await addToCart(product.id, quantity);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to continue', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') },
      ]);
      return;
    }
    await addToCart(product.id, quantity);
    router.push('/(tabs)/cart');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images[selectedImageIndex] || product.images[0] }}
            style={styles.mainImage}
            contentFit="contain"
            transition={200}
          />
          
          {product.discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discountPercent}% OFF</Text>
            </View>
          )}
          
          {product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsContainer}
            >
              {product.images.map((img, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailSelected,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} contentFit="cover" />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.detailsSection}>
          {category && (
            <Text style={styles.category}>{category.name}</Text>
          )}
          
          <Text style={styles.name}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{product.rating || 4.0}</Text>
              <Star size={12} color="#fff" fill="#fff" />
            </View>
            <Text style={styles.reviewCount}>{product.reviewCount || 0} Reviews</Text>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>₹{price.toLocaleString()}</Text>
            {product.discountPercent > 0 && (
              <>
                <Text style={styles.originalPrice}>₹{product.basePrice.toLocaleString()}</Text>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save ₹{savings.toLocaleString()}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.stockInfo}>
            {product.inventory > 0 ? (
              <View style={styles.inStock}>
                <Package size={16} color={Colors.success} />
                <Text style={styles.inStockText}>
                  {product.inventory > 10 ? 'In Stock' : `Only ${product.inventory} left`}
                </Text>
              </View>
            ) : (
              <View style={styles.outOfStock}>
                <Package size={16} color={Colors.error} />
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Truck size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Free Delivery</Text>
            </View>
            <View style={styles.featureItem}>
              <Shield size={20} color={Colors.success} />
              <Text style={styles.featureText}>Secure Payment</Text>
            </View>
            <View style={styles.featureItem}>
              <Package size={20} color={Colors.warning} />
              <Text style={styles.featureText}>Easy Returns</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descriptionTitle}>Product Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.specsSection}>
            <Text style={styles.specsTitle}>Specifications</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Weight</Text>
              <Text style={styles.specValue}>{product.weightKg} kg</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Category</Text>
              <Text style={styles.specValue}>{category?.name || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {product.inventory > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.quantitySelector}>
            <Pressable
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={() => quantity > 1 && setQuantity(q => q - 1)}
              disabled={quantity <= 1}
            >
              <Minus size={18} color={quantity <= 1 ? Colors.textMuted : Colors.text} />
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable
              style={[styles.quantityButton, quantity >= product.inventory && styles.quantityButtonDisabled]}
              onPress={() => quantity < product.inventory && setQuantity(q => q + 1)}
              disabled={quantity >= product.inventory}
            >
              <Plus size={18} color={quantity >= product.inventory ? Colors.textMuted : Colors.text} />
            </Pressable>
          </View>

          <Pressable style={styles.addToCartButton} onPress={handleAddToCart}>
            <ShoppingCart size={20} color={Colors.primary} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </Pressable>

          <Pressable style={styles.buyNowButton} onPress={handleBuyNow}>
            <Zap size={20} color="#fff" />
            <Text style={styles.buyNowText}>Buy Now</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  imageSection: {
    backgroundColor: Colors.surface,
    paddingBottom: 16,
  },
  mainImage: {
    width: width,
    height: width * 0.85,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginRight: 10,
  },
  thumbnailSelected: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  detailsSection: {
    backgroundColor: Colors.surface,
    marginTop: 8,
    padding: 16,
  },
  category: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 10,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 16,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  savingsText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  stockInfo: {
    marginTop: 12,
  },
  inStock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inStockText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  outOfStock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outOfStockText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  specsSection: {
    marginTop: 20,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
  },
  specsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  specLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  specValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    width: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  buyNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
