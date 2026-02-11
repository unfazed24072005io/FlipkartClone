import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Filter, ArrowUpDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import ProductCard from '@/components/ProductCard';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'rating';

export default function CategoryProductsScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName: string }>();
  const router = useRouter();
  const { products, getProductPrice } = useData();
  
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const categoryProducts = useMemo(() => {
    let filtered = products.filter(p => p.categoryId === categoryId && p.active && p.inventory > 0);
    
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
      case 'price_low':
        return filtered.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      case 'price_high':
        return filtered.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return filtered;
    }
  }, [products, categoryId, sortBy, getProductPrice]);

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'newest', label: 'Newest First' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Top Rated' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: categoryName || 'Products' }} />
      
      <View style={styles.toolbar}>
        <Text style={styles.resultCount}>{categoryProducts.length} Products</Text>
        <Pressable style={styles.sortButton} onPress={() => setShowSortMenu(!showSortMenu)}>
          <ArrowUpDown size={18} color={Colors.text} />
          <Text style={styles.sortButtonText}>Sort</Text>
        </Pressable>
      </View>

      {showSortMenu && (
        <View style={styles.sortMenu}>
          {sortOptions.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.sortOption, sortBy === option.id && styles.sortOptionActive]}
              onPress={() => {
                setSortBy(option.id);
                setShowSortMenu(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.id && styles.sortOptionTextActive
              ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        data={categoryProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.productRow}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No products in this category</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            price={getProductPrice(item)}
            onPress={() => router.push({ pathname: '/(tabs)/(home)/product', params: { id: item.id } })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
  },
  sortButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  sortMenu: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortOptionActive: {
    backgroundColor: Colors.primaryLight,
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  sortOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  productList: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
