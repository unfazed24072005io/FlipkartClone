import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  Edit2, 
  ChevronRight, 
  Package,
  ShoppingBag,
  X,
  Shield,
  Users,
  Search,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { User as UserType, UserRole } from '@/types';

const roleColors: Record<UserRole, string> = {
  user: Colors.user,
  seller: Colors.seller,
  distributor: Colors.distributor,
  admin: Colors.admin,
};

const roleLabels: Record<UserRole, string> = {
  user: 'Customer',
  seller: 'Seller',
  distributor: 'Distributor',
  admin: 'Administrator',
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { orders, allUsers, updateUserStatus, updateUserRole, deleteUser } = useData();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const isAdmin = user?.role === 'admin';

  const stats = useMemo(() => {
    const userOrders = orders.filter(o => o.uid === user?.uid);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = userOrders.filter(o => o.status === 'pending').length;
    const deliveredOrders = userOrders.filter(o => o.status === 'delivered').length;
    
    return {
      totalOrders: userOrders.length,
      totalSpent,
      pendingOrders,
      deliveredOrders,
    };
  }, [orders, user]);

  const adminStats = useMemo(() => {
    if (!isAdmin) return null;
    
    const users = allUsers.filter(u => u.role === 'user').length;
    const sellers = allUsers.filter(u => u.role === 'seller').length;
    const distributors = allUsers.filter(u => u.role === 'distributor').length;
    const blocked = allUsers.filter(u => u.status === 'blocked').length;
    
    return { users, sellers, distributors, blocked };
  }, [allUsers, isAdmin]);

  const filteredUsers = useMemo(() => {
    let filtered = allUsers;
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    if (userSearch.trim()) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      );
    }
    
    return filtered;
  }, [allUsers, roleFilter, userSearch]);

  const handleUpdateProfile = async () => {
    const success = await updateProfile({
      name: editName,
      phone: editPhone,
      address: editAddress,
    });
    
    if (success) {
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  const handleToggleUserStatus = (targetUser: UserType) => {
    const newStatus = targetUser.status === 'active' ? 'blocked' : 'active';
    Alert.alert(
      `${newStatus === 'blocked' ? 'Block' : 'Unblock'} User`,
      `Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'unblock'} ${targetUser.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm',
          onPress: () => {
            updateUserStatus(targetUser.uid, newStatus);
            setSelectedUser(null);
          }
        },
      ]
    );
  };

  const handleChangeRole = (targetUser: UserType, newRole: UserRole) => {
    updateUserRole(targetUser.uid, newRole);
    setSelectedUser({ ...targetUser, role: newRole });
  };

  const handleDeleteUser = (targetUser: UserType) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${targetUser.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteUser(targetUser.uid);
            setSelectedUser(null);
          }
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <User size={80} color={Colors.border} />
        <Text style={styles.emptyTitle}>Not signed in</Text>
        <Text style={styles.emptySubtitle}>Sign in to view your profile</Text>
        <Pressable style={styles.signInButton} onPress={() => router.push('/login')}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[Colors.admin, '#E64A19']}
          style={styles.adminHeader}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarLarge}>
              <Shield size={36} color={Colors.admin} />
            </View>
            <Text style={styles.profileNameLarge}>{user?.name}</Text>
            <Text style={styles.profileRole}>Administrator</Text>
          </View>
        </LinearGradient>

        <View style={styles.adminStatsRow}>
          <View style={styles.adminStatCard}>
            <Text style={styles.adminStatValue}>{adminStats?.users}</Text>
            <Text style={styles.adminStatLabel}>Users</Text>
          </View>
          <View style={styles.adminStatCard}>
            <Text style={styles.adminStatValue}>{adminStats?.sellers}</Text>
            <Text style={styles.adminStatLabel}>Sellers</Text>
          </View>
          <View style={styles.adminStatCard}>
            <Text style={styles.adminStatValue}>{adminStats?.distributors}</Text>
            <Text style={styles.adminStatLabel}>Distributors</Text>
          </View>
          <View style={styles.adminStatCard}>
            <Text style={[styles.adminStatValue, { color: Colors.error }]}>{adminStats?.blocked}</Text>
            <Text style={styles.adminStatLabel}>Blocked</Text>
          </View>
        </View>

        <View style={styles.userManagement}>
          <Text style={styles.sectionTitle}>User Management</Text>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={Colors.textMuted}
              value={userSearch}
              onChangeText={setUserSearch}
            />
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.roleFilterScroll}
          >
            {(['all', 'user', 'seller', 'distributor', 'admin'] as const).map((role) => (
              <Pressable
                key={role}
                style={[
                  styles.roleFilterChip,
                  roleFilter === role && styles.roleFilterChipActive,
                ]}
                onPress={() => setRoleFilter(role)}
              >
                <Text style={[
                  styles.roleFilterText,
                  roleFilter === role && styles.roleFilterTextActive,
                ]}>
                  {role === 'all' ? 'All' : roleLabels[role]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.userList}
          renderItem={({ item }) => (
            <Pressable 
              style={styles.userCard}
              onPress={() => setSelectedUser(item)}
            >
              <View style={[styles.userAvatar, { backgroundColor: roleColors[item.role] + '20' }]}>
                <User size={20} color={roleColors[item.role]} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
              <View style={styles.userMeta}>
                <View style={[styles.roleBadge, { backgroundColor: roleColors[item.role] + '20' }]}>
                  <Text style={[styles.roleBadgeText, { color: roleColors[item.role] }]}>
                    {roleLabels[item.role]}
                  </Text>
                </View>
                {item.status === 'blocked' && (
                  <View style={styles.blockedBadge}>
                    <Text style={styles.blockedBadgeText}>Blocked</Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
        />

        <Pressable style={styles.logoutButtonAdmin} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutTextAdmin}>Logout</Text>
        </Pressable>

        <Modal
          visible={!!selectedUser}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedUser(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Details</Text>
                <Pressable onPress={() => setSelectedUser(null)}>
                  <X size={24} color={Colors.text} />
                </Pressable>
              </View>

              {selectedUser && (
                <ScrollView>
                  <View style={styles.userDetailHeader}>
                    <View style={[styles.userAvatarLarge, { backgroundColor: roleColors[selectedUser.role] + '20' }]}>
                      <User size={32} color={roleColors[selectedUser.role]} />
                    </View>
                    <Text style={styles.userDetailName}>{selectedUser.name}</Text>
                    <Text style={styles.userDetailEmail}>{selectedUser.email}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={styles.statusToggle}>
                      <Pressable
                        style={[
                          styles.statusOption,
                          selectedUser.status === 'active' && styles.statusOptionActive,
                        ]}
                        onPress={() => selectedUser.status !== 'active' && handleToggleUserStatus(selectedUser)}
                      >
                        <UserCheck size={16} color={selectedUser.status === 'active' ? '#fff' : Colors.success} />
                        <Text style={[
                          styles.statusOptionText,
                          selectedUser.status === 'active' && styles.statusOptionTextActive,
                        ]}>
                          Active
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.statusOption,
                          styles.statusOptionBlocked,
                          selectedUser.status === 'blocked' && styles.statusOptionBlockedActive,
                        ]}
                        onPress={() => selectedUser.status !== 'blocked' && handleToggleUserStatus(selectedUser)}
                      >
                        <UserX size={16} color={selectedUser.status === 'blocked' ? '#fff' : Colors.error} />
                        <Text style={[
                          styles.statusOptionText,
                          selectedUser.status === 'blocked' && styles.statusOptionTextActive,
                        ]}>
                          Blocked
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Role</Text>
                    <View style={styles.roleOptions}>
                      {(['user', 'seller', 'distributor', 'admin'] as UserRole[]).map((role) => (
                        <Pressable
                          key={role}
                          style={[
                            styles.roleOption,
                            selectedUser.role === role && { backgroundColor: roleColors[role] },
                          ]}
                          onPress={() => handleChangeRole(selectedUser, role)}
                        >
                          <Text style={[
                            styles.roleOptionText,
                            selectedUser.role === role && styles.roleOptionTextActive,
                          ]}>
                            {roleLabels[role]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Member Since</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.deleteUserButton}
                    onPress={() => handleDeleteUser(selectedUser)}
                  >
                    <Trash2 size={18} color={Colors.error} />
                    <Text style={styles.deleteUserText}>Delete User</Text>
                  </Pressable>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[roleColors[user?.role || 'user'], roleColors[user?.role || 'user'] + 'CC']}
          style={styles.header}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <User size={32} color={roleColors[user?.role || 'user']} />
            </View>
            <Text style={styles.profileName}>{user?.name}</Text>
            <View style={styles.roleBadgeHeader}>
              <Text style={styles.roleBadgeHeaderText}>{roleLabels[user?.role || 'user']}</Text>
            </View>
          </View>
          
          <Pressable style={styles.editButton} onPress={() => {
            setEditName(user?.name || '');
            setEditPhone(user?.phone || '');
            setEditAddress(user?.address || '');
            setShowEditModal(true);
          }}>
            <Edit2 size={18} color="#fff" />
          </Pressable>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ShoppingBag size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={24} color={Colors.success} />
            <Text style={styles.statValue}>{stats.deliveredOrders}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail size={20} color={Colors.textMuted} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Phone size={20} color={Colors.textMuted} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MapPin size={20} color={Colors.textMuted} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{user?.address || 'Not provided'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(tabs)/orders')}>
            <Package size={22} color={Colors.text} />
            <Text style={styles.menuItemText}>My Orders</Text>
            <ChevronRight size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={22} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textMuted}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.textMuted}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your address"
                placeholderTextColor={Colors.textMuted}
                value={editAddress}
                onChangeText={setEditAddress}
                multiline
                numberOfLines={3}
              />
            </View>

            <Pressable style={styles.saveButton} onPress={handleUpdateProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
  },
  adminHeader: {
    padding: 24,
    paddingBottom: 20,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  profileNameLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  roleBadgeHeader: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: -20,
    marginHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  adminStatsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  adminStatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  adminStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  adminStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoContent: {
    marginLeft: 14,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.text,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 24,
    backgroundColor: Colors.errorLight,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  logoutButtonAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    backgroundColor: Colors.errorLight,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  logoutTextAdmin: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  userManagement: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text,
  },
  roleFilterScroll: {
    marginBottom: 12,
  },
  roleFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  roleFilterChipActive: {
    backgroundColor: Colors.admin,
  },
  roleFilterText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  roleFilterTextActive: {
    color: '#fff',
  },
  userList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  blockedBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  blockedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.error,
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
    maxHeight: '85%',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userDetailName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  userDetailEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  statusToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.successLight,
  },
  statusOptionActive: {
    backgroundColor: Colors.success,
  },
  statusOptionBlocked: {
    backgroundColor: Colors.errorLight,
  },
  statusOptionBlockedActive: {
    backgroundColor: Colors.error,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  statusOptionTextActive: {
    color: '#fff',
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
  roleOptionTextActive: {
    color: '#fff',
  },
  deleteUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.errorLight,
    marginTop: 16,
  },
  deleteUserText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
});
