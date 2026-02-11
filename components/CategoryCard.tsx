import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  size?: 'small' | 'large';
}

export default function CategoryCard({ category, onPress, size = 'small' }: CategoryCardProps) {
  const isLarge = size === 'large';
  
  return (
    <Pressable 
      style={[styles.container, isLarge && styles.containerLarge]} 
      onPress={onPress}
    >
      <View style={[styles.imageWrapper, isLarge && styles.imageWrapperLarge]}>
        <Image
          source={{ uri: category.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      </View>
      <Text style={[styles.name, isLarge && styles.nameLarge]} numberOfLines={2}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginRight: 16,
  },
  containerLarge: {
    width: 110,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceVariant,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapperLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  nameLarge: {
    fontSize: 13,
  },
});
