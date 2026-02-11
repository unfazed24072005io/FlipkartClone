import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Grid3X3, ShoppingCart, Package, User, LayoutDashboard, Users, Settings } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const role = user?.role || 'user';

  if (role === 'admin') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.admin,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.borderLight,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Categories',
            tabBarIcon: ({ color, size }) => <Grid3X3 size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Products',
            tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Users',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
      </Tabs>
    );
  }

  if (role === 'seller' || role === 'distributor') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: role === 'seller' ? Colors.seller : Colors.distributor,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.borderLight,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Products',
            tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => <Grid3X3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
