import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Bell, ShoppingBag, TrendingUp, Zap, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import LoadingScreen from '@/components/LoadingScreen';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { categories, products, banners, isLoading, refreshData, getProductPrice, cart } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const activeProducts = useMemo(() => 
    products.filter(p => p.active && p.inventory > 0),
    [products]
  );

  const trendingProducts = useMemo(() => 
    [...activeProducts].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 6),
    [activeProducts]
  );

  const dealsProducts = useMemo(() => 
    [...activeProducts].sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 6),
    [activeProducts]
  );

  const recentProducts = useMemo(() => 
    [...activeProducts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
    [activeProducts]
  );

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return activeProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [activeProducts, searchQuery]);

  const cartItemCount = cart.length;

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading products..." />;
  }

  const renderSectionHeader = (icon: React.ReactNode, title: string, color: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrapper, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0] || 'User'}` : 'Welcome to FlipMart'}
            </Text>
            <Text style={styles.subGreeting}>What are you looking for?</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconButton}>
              <Bell size={22} color="#fff" />
            </Pressable>
            <Pressable 
              style={styles.iconButton}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <ShoppingBag size={22} color="#fff" />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {searchQuery.trim() ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.searchResults}
          columnWrapperStyle={styles.productRow}
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>No products found for "{searchQuery}"</Text>
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
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        >
          <BannerCarousel banners={banners} />

          <View style={styles.section}>
            <Text style={styles.categoriesTitle}>Shop by Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onPress={() => router.push({ 
                    pathname: '/(tabs)/(home)/category-products', 
                    params: { categoryId: category.id, categoryName: category.name } 
                  })}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            {renderSectionHeader(
              <TrendingUp size={18} color={Colors.secondary} />,
              'Trending Now',
              Colors.secondary
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductScroll}
            >
              {trendingProducts.map((product) => (
                <View key={product.id} style={styles.horizontalProductCard}>
                  <ProductCard
                    product={product}
                    price={getProductPrice(product)}
                    onPress={() => router.push({ pathname: '/(tabs)/(home)/product', params: { id: product.id } })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            {renderSectionHeader(
              <Zap size={18} color={Colors.warning} />,
              'Best Deals',
              Colors.warning
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductScroll}
            >
              {dealsProducts.map((product) => (
                <View key={product.id} style={styles.horizontalProductCard}>
                  <ProductCard
                    product={product}
                    price={getProductPrice(product)}
                    onPress={() => router.push({ pathname: '/(tabs)/(home)/product', params: { id: product.id } })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.section, { marginBottom: 24 }]}>
            {renderSectionHeader(
              <Clock size={18} color={Colors.primary} />,
              'Recently Added',
              Colors.primary
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductScroll}
            >
              {recentProducts.map((product) => (
                <View key={product.id} style={styles.horizontalProductCard}>
                  <ProductCard
                    product={product}
                    price={getProductPrice(product)}
                    onPress={() => router.push({ pathname: '/(tabs)/(home)/product', params: { id: product.id } })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {!isAuthenticated && (
        <View style={[styles.loginPrompt, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.loginPromptText}>Sign in to start shopping</Text>
          <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Sign In</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingRight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  horizontalProductScroll: {
    paddingRight: 16,
  },
  horizontalProductCard: {
    marginRight: 12,
    width: (width - 48) / 2,
  },
  searchResults: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  emptySearch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptySearchText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  loginPrompt: {
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
  loginPromptText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
