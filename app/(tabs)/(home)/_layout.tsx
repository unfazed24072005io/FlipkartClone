import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="product"
        options={{
          title: 'Product Details',
        }}
      />
      <Stack.Screen
        name="category-products"
        options={{
          title: 'Products',
        }}
      />
    </Stack>
  );
}
