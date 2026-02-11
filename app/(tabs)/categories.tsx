import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Category } from '@/types';

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { categories, products, addCategory, updateCategory, deleteCategory, getProductPrice } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');

  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller' || user?.role === 'distributor';

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const getCategoryProductCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId && p.active).length;
  };

  const handleAddEdit = () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, { 
        name: categoryName, 
        image: categoryImage || editingCategory.image 
      });
    } else {
      addCategory(
        categoryName,
        categoryImage || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'
      );
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteCategory(category.id)
        },
      ]
    );
  };

  const resetForm = () => {
    setCategoryName('');
    setCategoryImage('');
    setEditingCategory(null);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryImage(category.image);
    setShowModal(true);
  };

  const handleCategoryPress = (category: Category) => {
    if (isSeller) {
      router.push({ 
        pathname: '/(tabs)/(home)/category-products', 
        params: { categoryId: category.id, categoryName: category.name } 
      });
    } else {
      router.push({ 
        pathname: '/(tabs)/(home)/category-products', 
        params: { categoryId: category.id, categoryName: category.name } 
      });
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <Pressable 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.categoryImage}
        contentFit="cover"
      />
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.productCount}>{getCategoryProductCount(item.id)} Products</Text>
      </View>
      
      {isAdmin && (
        <View style={styles.categoryActions}>
          <Pressable style={styles.actionButton} onPress={() => openEditModal(item)}>
            <Edit2 size={18} color={Colors.primary} />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => handleDelete(item)}>
            <Trash2 size={18} color={Colors.error} />
          </Pressable>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isAdmin ? 'Manage Categories' : isSeller ? 'Browse Products' : 'Categories'}
        </Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {isAdmin && (
          <Pressable 
            style={styles.addButton} 
            onPress={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Category</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No categories found</Text>
          </View>
        }
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </Text>
              <Pressable onPress={() => setShowModal(false)}>
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                placeholderTextColor={Colors.textMuted}
                value={categoryName}
                onChangeText={setCategoryName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter image URL"
                placeholderTextColor={Colors.textMuted}
                value={categoryImage}
                onChangeText={setCategoryImage}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                style={styles.cancelButton} 
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAddEdit}>
                <Text style={styles.saveButtonText}>
                  {editingCategory ? 'Update' : 'Add'}
                </Text>
              </Pressable>
            </View>
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.admin,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  categoryContent: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  productCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
